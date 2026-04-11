/* ============================================================
   SW RAID vs ASA — Interactive Performance Calculator
   Formulae sourced from RAID literature, Patterson et al.,
   Leventhal 2009, Elerath & Pecht RAID-6 models, and
   ASA/ZFS hash-based deduplication white papers.
   ============================================================ */

'use strict';

// ── DISK PRESETS ────────────────────────────────────────────
const DISK_PRESETS = {
  'hdd': {
    label: 'HDD 7.2k RPM',
    iops: 180,         // random 4K
    seqBW: 220,        // MB/s sequential
    latUs: 5000,       // µs seek + rotational
    iopsSeq: 2200,     // sequential "iops" equivalent at large block
  },
  'sata-ssd': {
    label: 'SATA SSD',
    iops: 90000,
    seqBW: 550,
    latUs: 120,
    iopsSeq: 95000,
  },
  'nvme': {
    label: 'NVMe SSD',
    iops: 800000,
    seqBW: 6500,
    latUs: 70,
    iopsSeq: 900000,
  },
};

// File size steps: 1 MB → 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 1024 MB
const FILE_SIZE_STEPS_MB = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
const CHUNK_SIZE_STEPS_KB = [4, 16, 64, 256, 1024, 4096]; // KB

// ── STATE ────────────────────────────────────────────────────
const state = {
  diskCount: 12,
  raidLevel: 5,
  rwRatio: 70,       // % reads
  fileSizeIdx: 6,    // index into FILE_SIZE_STEPS_MB → 64 MB
  diskType: 'hdd',
  chunkSizeIdx: 3,   // index into CHUNK_SIZE_STEPS_KB → 256 KB
  dedupRatio: 2.5,   // stored as /10 of slider
  compressionRatio: 1.5,
  asaOverhead: 3,    // %
  // Manual overrides (synced to presets initially)
  diskIOPS: 180,
  diskBW: 220,
  diskLatUs: 5000,
};

// ── RAID MATH ────────────────────────────────────────────────

/**
 * RAID write penalty (number of disk I/Os per logical write).
 *
 * RAID-5 (read-modify-write):
 *   W_penalty = 4  (read old data + read old parity + write new data + write new parity)
 *   With full-stripe write (large I/O): W_penalty = N/(N-1) * 2 / 2 → simplifies to 2
 *   We model both and blend by transfer size vs stripe width.
 *
 * RAID-6:
 *   Small write: W_penalty = 6  (old D, old P, old Q, new D, new P, new Q)
 *   Full-stripe: W_penalty = 2
 *
 * RAID-10:
 *   W_penalty = 2 always (mirror write)
 *
 * Blend factor: isFullStripe = fileSizeMB / (chunkSizeKB/1024 * (N - parityDisks))
 * Clamp to [0,1]. fullStripe=1 → full stripe write.
 */
function raidWritePenalty(raidLevel, diskCount, fileSizeMB, chunkSizeKB) {
  const parityDisks = raidLevel === 6 ? 2 : raidLevel === 5 ? 1 : 0;
  const dataDisks = Math.max(1, diskCount - parityDisks);
  const stripeWidthMB = (chunkSizeKB / 1024) * dataDisks;
  const fullStripeFraction = Math.min(1, fileSizeMB / stripeWidthMB);

  let smallWritePenalty, fullStripePenalty;

  if (raidLevel === 5) {
    smallWritePenalty = 4;
    fullStripePenalty = 2;
  } else if (raidLevel === 6) {
    smallWritePenalty = 6;
    fullStripePenalty = 2;
  } else { // RAID-10
    smallWritePenalty = 2;
    fullStripePenalty = 2;
  }

  // Blend: at full stripe, penalty approaches full-stripe value
  return smallWritePenalty * (1 - fullStripeFraction) + fullStripePenalty * fullStripeFraction;
}

/**
 * RAID usable capacity fraction.
 * RAID-5: (N-1)/N
 * RAID-6: (N-2)/N
 * RAID-10: 0.5
 */
function raidUsableFraction(raidLevel, diskCount) {
  if (raidLevel === 10) return 0.5;
  const parityDisks = raidLevel === 6 ? 2 : 1;
  return Math.max(0, (diskCount - parityDisks) / diskCount);
}

/**
 * RAID effective write IOPS.
 * Available write IOPS at disk = diskIOPS * diskCount
 * Divided by write penalty.
 * Only write portion (1 - rwFraction).
 */
function raidEffectiveWriteIOPS(diskCount, diskIOPS, writePenalty) {
  return (diskCount * diskIOPS) / writePenalty;
}

/**
 * RAID effective read IOPS.
 * RAID-5/6: all data disks contribute to reads.
 * RAID-10: only one mirror arm reads, so N/2 disks.
 */
function raidEffectiveReadIOPS(raidLevel, diskCount, diskIOPS) {
  if (raidLevel === 10) return (diskCount / 2) * diskIOPS;
  return diskCount * diskIOPS;
}

/**
 * RAID sequential throughput (MB/s).
 * Full-stripe read: all data disks (N - parityDisks) contribute.
 * Full-stripe write: limited by write penalty.
 */
function raidThroughput(raidLevel, diskCount, diskBW, rwFraction, fileSizeMB, chunkSizeKB) {
  const parityDisks = raidLevel === 6 ? 2 : raidLevel === 5 ? 1 : 0;
  const dataDisks = raidLevel === 10 ? diskCount / 2 : diskCount - parityDisks;
  const penalty = raidWritePenalty(raidLevel, diskCount, fileSizeMB, chunkSizeKB);

  const readBW = dataDisks * diskBW * rwFraction;
  const writeBW = (dataDisks * diskBW * (1 - rwFraction)) / (penalty / 2); // /2: penalty includes both reads+writes
  return readBW + writeBW;
}

// ── ASA MATH ────────────────────────────────────────────────

/**
 * ASA (Adaptive Segment Addressing) models content-defined chunking with
 * SHA-256 (or similar) per-chunk fingerprinting. Key properties:
 *
 * 1. Write I/O amplification: each chunk requires a hash lookup (1 metadata read)
 *    + conditional data read (for inline dedup check) + write if unique.
 *    Effective write IOPS cost ≈ 1 + (1/dedup_ratio) per chunk I/O.
 *
 * 2. No RAID write penalty for parity computation — ASA stores segments
 *    on any available disk and maintains erasure coding separately,
 *    so the write penalty is effectively 1 for data + parity overhead
 *    which we model as 1 + 1/dataDisks (similar to object stores).
 *
 * 3. Dedup savings: effectively multiplies usable capacity.
 *
 * 4. Metadata overhead: hash index ~ O(chunk_count). Typically 3-8% of raw.
 *
 * Reference: Zhu et al. "Avoiding the Disk Bottleneck in the Data Domain
 * Deduplication File System" (FAST 2008); Factor et al. (IBM 2005 ASA patent).
 */

/**
 * ASA write I/O cost per logical write.
 * Each logical block → chunked → per chunk: hash lookup + dedup check.
 * For unique chunks: write data + update index.
 * For duplicate chunks: only index update (very cheap).
 * Effective I/Os per unique-chunk write ≈ 2.5 (lookup read + data write + index write).
 * Blended by dedup ratio.
 */
function asaWriteAmplification(dedupRatio, compressionRatio, asaOverheadPct) {
  // Fraction of data that is unique (must be written)
  const uniqueFraction = 1 / dedupRatio;
  // Per-unique-chunk cost: metadata lookup read + data write + metadata write = ~3 I/Os
  const uniqueChunkCost = 3.0;
  // Per-duplicate cost: metadata lookup read + match confirmation = ~1.5 I/Os  
  const dupChunkCost = 1.5;
  // Blended amplification
  const amp = uniqueFraction * uniqueChunkCost + (1 - uniqueFraction) * dupChunkCost;
  // Add overhead for metadata management
  const overheadFactor = 1 + asaOverheadPct / 100;
  return amp * overheadFactor;
}

/**
 * ASA effective write IOPS.
 * Total disk IOPS / asaWriteAmplification.
 */
function asaEffectiveWriteIOPS(diskCount, diskIOPS, dedupRatio, compressionRatio, asaOverheadPct) {
  const amp = asaWriteAmplification(dedupRatio, compressionRatio, asaOverheadPct);
  return (diskCount * diskIOPS) / amp;
}

/**
 * ASA effective capacity multiplier.
 * Raw → after RAID equivalent overhead (we assume N-way erasure with 1 parity equiv.)
 * → after dedup → after compression → minus metadata.
 */
function asaCapacityMultiplier(dedupRatio, compressionRatio, asaOverheadPct) {
  return dedupRatio * compressionRatio * (1 - asaOverheadPct / 100);
}

/**
 * ASA throughput (MB/s).
 * Read path: very close to raw disk BW * N (no RAID overhead on reads).
 * Write path: limited by uniqueFraction of data needing actual writes.
 * We also account for chunk-size alignment overhead on writes.
 */
function asaThroughput(diskCount, diskBW, rwFraction, dedupRatio, compressionRatio, asaOverheadPct, chunkSizeKB, fileSizeMB) {
  const amp = asaWriteAmplification(dedupRatio, compressionRatio, asaOverheadPct);
  // Read: all disks, direct. Small overhead for hash verification.
  const readBW = diskCount * diskBW * rwFraction * 0.97; // 3% hash overhead on reads
  // Write: divided by amplification
  const rawWriteBW = diskCount * diskBW * (1 - rwFraction);
  const writeBW = rawWriteBW / amp;
  return readBW + writeBW;
}

/**
 * Effective service latency for a given file size.
 * Latency = queue_depth_wait + transfer_time + disk_seek_latency (for HDD).
 * Transfer time = fileSize / (stripe_BW).
 * We model single-threaded latency (no concurrency).
 */
function raidLatencyMs(raidLevel, diskCount, diskBW, diskLatUs, fileSizeMB, chunkSizeKB, isWrite) {
  const parityDisks = raidLevel === 6 ? 2 : raidLevel === 5 ? 1 : 0;
  const dataDisks = raidLevel === 10 ? diskCount / 2 : diskCount - parityDisks;
  const stripeBW = dataDisks * diskBW; // MB/s
  const transferMs = (fileSizeMB / stripeBW) * 1000;
  const seekMs = diskLatUs / 1000;
  const penalty = isWrite ? raidWritePenalty(raidLevel, diskCount, fileSizeMB, chunkSizeKB) : 1;
  // Write latency: seek + transfer + parity computation overhead (20% extra for SW RAID parity)
  return seekMs + transferMs * (isWrite ? (1 + (penalty - 1) * 0.15) : 1);
}

function asaLatencyMs(diskCount, diskBW, diskLatUs, fileSizeMB, chunkSizeKB, dedupRatio, isWrite) {
  const stripeBW = diskCount * diskBW;
  const transferMs = (fileSizeMB / stripeBW) * 1000;
  const seekMs = diskLatUs / 1000;
  if (!isWrite) {
    // Read: minimal overhead — hash lookup is in-memory DRAM table
    return seekMs + transferMs * 1.03;
  }
  // Write: chunk, hash, lookup, write unique chunks
  const chunkingMs = (fileSizeMB * 1024 / chunkSizeKB) * 0.005; // 5µs per chunk hash (NVMe-class)
  const uniqueFraction = 1 / dedupRatio;
  const writeMs = seekMs + transferMs * uniqueFraction;
  return chunkingMs + writeMs;
}

// ── BREAKEVEN ANALYSIS ───────────────────────────────────────

/**
 * At what disk count does ASA effective write IOPS exceed RAID write IOPS?
 * Returns disk count where difference crosses zero, or null if no crossover.
 */
function computeBreakevenDiskCount(raidLevel, diskIOPS, diskBW, diskLatUs, fileSizeMB, chunkSizeKB, dedupRatio, compressionRatio, asaOverheadPct) {
  for (let n = 4; n <= 128; n++) {
    const penalty = raidWritePenalty(raidLevel, n, fileSizeMB, chunkSizeKB);
    const raidW = raidEffectiveWriteIOPS(n, diskIOPS, penalty);
    const asaW = asaEffectiveWriteIOPS(n, diskIOPS, dedupRatio, compressionRatio, asaOverheadPct);
    if (asaW > raidW) return n;
  }
  return '>128';
}

// ── CHART INSTANCES ──────────────────────────────────────────
let charts = {};

function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    raid: style.getPropertyValue('--chart-1').trim(),
    asa: style.getPropertyValue('--chart-2').trim(),
    read: style.getPropertyValue('--chart-3').trim(),
    write: style.getPropertyValue('--chart-5').trim(),
    grid: style.getPropertyValue('--color-border').trim(),
    text: style.getPropertyValue('--color-text-muted').trim(),
    zero: style.getPropertyValue('--color-text-faint').trim(),
  };
}

function chartDefaults(colors) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface-2').trim(),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim(),
        borderWidth: 1,
        titleColor: colors.text,
        bodyColor: colors.text,
        titleFont: { family: 'DM Sans', size: 11, weight: '600' },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        padding: 8,
        cornerRadius: 6,
      }
    },
    scales: {
      x: {
        grid: { color: colors.grid + '40', drawBorder: false },
        ticks: { color: colors.text, font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: colors.grid + '40', drawBorder: false },
        ticks: { color: colors.text, font: { family: 'JetBrains Mono', size: 10 } },
      }
    }
  };
}

function formatNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
}

function fmtMBs(n) {
  if (n >= 1000) return (n / 1000).toFixed(2) + ' GB/s';
  return n.toFixed(0) + ' MB/s';
}

function fmtMs(n) {
  if (n < 1) return (n * 1000).toFixed(0) + ' µs';
  return n.toFixed(1) + ' ms';
}

function fmtMB(n) {
  if (n >= 1024) return (n / 1024).toFixed(0) + ' GB';
  return n.toFixed(0) + ' MB';
}

// ── CHART BUILDERS ───────────────────────────────────────────

function buildThroughputChart(s) {
  const colors = getChartColors();
  const diskCounts = [];
  for (let n = 4; n <= 64; n += 2) diskCounts.push(n);
  const rw = s.rwRatio / 100;
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];

  const raidData = diskCounts.map(n =>
    raidThroughput(s.raidLevel, n, s.diskBW, rw, fileMB, chunkKB)
  );
  const asaData = diskCounts.map(n =>
    asaThroughput(n, s.diskBW, rw, s.dedupRatio, s.compressionRatio, s.asaOverhead, chunkKB, fileMB)
  );

  const labels = diskCounts.map(n => n + 'd');

  if (charts.throughput) charts.throughput.destroy();
  const ctx = document.getElementById('chartThroughput').getContext('2d');
  const defaults = chartDefaults(colors);
  charts.throughput = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `SW RAID-${s.raidLevel}`,
          data: raidData,
          borderColor: colors.raid,
          backgroundColor: colors.raid + '18',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: 'ASA',
          data: asaData,
          borderColor: colors.asa,
          backgroundColor: colors.asa + '18',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${fmtMBs(ctx.raw)}`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'Effective Throughput (MB/s)', color: colors.text, font: { family: 'DM Sans', size: 10 } }
        },
        x: { ...defaults.scales.x, title: { display: true, text: 'Disk Count', color: colors.text, font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });

  // Update legend
  const leg = document.getElementById('legend1');
  leg.innerHTML = `
    <div class="legend-item"><div class="legend-line" style="background:${colors.raid}"></div>SW RAID-${s.raidLevel}</div>
    <div class="legend-item"><div class="legend-line" style="background:${colors.asa}"></div>ASA</div>
  `;
}

function buildWritePenaltyChart(s) {
  const colors = getChartColors();
  const levels = [5, 6, 10];
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];

  // RAID penalties for each level at current disk count
  const raidPenalties = levels.map(lv =>
    raidWritePenalty(lv, s.diskCount, fileMB, chunkKB)
  );
  // ASA amplification (same regardless of RAID level)
  const asaAmp = asaWriteAmplification(s.dedupRatio, s.compressionRatio, s.asaOverhead);

  const labels = ['RAID-5', 'RAID-6', 'RAID-10', 'ASA'];
  const data = [...raidPenalties, asaAmp];
  const bgColors = [colors.raid + 'cc', colors.raid + '88', colors.raid + '55', colors.asa + 'cc'];

  if (charts.writePenalty) charts.writePenalty.destroy();
  const ctx = document.getElementById('chartWritePenalty').getContext('2d');
  const defaults = chartDefaults(colors);
  charts.writePenalty = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'I/O Amplification',
        data,
        backgroundColor: bgColors,
        borderColor: [colors.raid, colors.raid, colors.raid, colors.asa],
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.raw.toFixed(2)}× I/Os per write`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'I/Os per logical write', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          beginAtZero: true,
        }
      }
    }
  });
}

function buildLatencyChart(s) {
  const colors = getChartColors();
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];

  const raidReadData = FILE_SIZE_STEPS_MB.map(mb =>
    raidLatencyMs(s.raidLevel, s.diskCount, s.diskBW, s.diskLatUs, mb, chunkKB, false)
  );
  const raidWriteData = FILE_SIZE_STEPS_MB.map(mb =>
    raidLatencyMs(s.raidLevel, s.diskCount, s.diskBW, s.diskLatUs, mb, chunkKB, true)
  );
  const asaReadData = FILE_SIZE_STEPS_MB.map(mb =>
    asaLatencyMs(s.diskCount, s.diskBW, s.diskLatUs, mb, chunkKB, s.dedupRatio, false)
  );
  const asaWriteData = FILE_SIZE_STEPS_MB.map(mb =>
    asaLatencyMs(s.diskCount, s.diskBW, s.diskLatUs, mb, chunkKB, s.dedupRatio, true)
  );

  const labels = FILE_SIZE_STEPS_MB.map(mb => fmtMB(mb));

  if (charts.latency) charts.latency.destroy();
  const ctx = document.getElementById('chartLatency').getContext('2d');
  const defaults = chartDefaults(colors);
  charts.latency = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `RAID-${s.raidLevel} Read`,
          data: raidReadData,
          borderColor: colors.raid,
          borderDash: [],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: `RAID-${s.raidLevel} Write`,
          data: raidWriteData,
          borderColor: colors.raid,
          borderDash: [4, 3],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'ASA Read',
          data: asaReadData,
          borderColor: colors.asa,
          borderDash: [],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'ASA Write',
          data: asaWriteData,
          borderColor: colors.asa,
          borderDash: [4, 3],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: colors.text,
            font: { family: 'JetBrains Mono', size: 9 },
            boxWidth: 16,
            padding: 8,
            usePointStyle: true,
          }
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${fmtMs(ctx.raw)}`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'Latency (ms)', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          beginAtZero: true,
        }
      }
    }
  });
}

function buildBreakevenChart(s) {
  const colors = getChartColors();
  const diskCounts = [];
  for (let n = 4; n <= 64; n += 2) diskCounts.push(n);
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];

  const diffData = diskCounts.map(n => {
    const penalty = raidWritePenalty(s.raidLevel, n, fileMB, chunkKB);
    const raidW = raidEffectiveWriteIOPS(n, s.diskIOPS, penalty);
    const asaW = asaEffectiveWriteIOPS(n, s.diskIOPS, s.dedupRatio, s.compressionRatio, s.asaOverhead);
    return asaW - raidW; // positive = ASA wins
  });

  // Color each bar
  const bgColors = diffData.map(v =>
    v >= 0 ? colors.asa + 'cc' : colors.raid + 'cc'
  );
  const borderColors = diffData.map(v =>
    v >= 0 ? colors.asa : colors.raid
  );

  const labels = diskCounts.map(n => n + 'd');

  if (charts.breakeven) charts.breakeven.destroy();
  const ctx = document.getElementById('chartBreakeven').getContext('2d');
  const defaults = chartDefaults(colors);
  charts.breakeven = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'ASA − RAID Write IOPS',
        data: diffData,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              const winner = v >= 0 ? 'ASA' : 'RAID';
              return `${winner} advantage: ${formatNum(Math.abs(v))} IOPS`;
            }
          }
        },
        annotation: undefined,
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'ASA − RAID Write IOPS (positive = ASA wins)', color: colors.text, font: { family: 'DM Sans', size: 10 } },
        },
        x: { ...defaults.scales.x, title: { display: true, text: 'Disk Count', color: colors.text, font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}

function buildCapacityChart(s) {
  const colors = getChartColors();
  const rawTB = 10; // fixed 10 TB raw pool for comparison

  const raidUsable = rawTB * raidUsableFraction(s.raidLevel, s.diskCount);
  const asaUsable = raidUsable * asaCapacityMultiplier(s.dedupRatio, s.compressionRatio, s.asaOverhead);

  const labels = ['Raw', `RAID-${s.raidLevel}`, 'ASA (dedup+compress)'];
  const data = [rawTB, raidUsable, Math.min(asaUsable, rawTB * 15)]; // cap display at 15x

  if (charts.capacity) charts.capacity.destroy();
  const ctx = document.getElementById('chartCapacity').getContext('2d');
  const defaults = chartDefaults(colors);
  charts.capacity = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Effective Capacity (TB)',
        data,
        backgroundColor: [
          colors.text + '33',
          colors.raid + 'bb',
          colors.asa + 'bb',
        ],
        borderColor: [colors.text + '55', colors.raid, colors.asa],
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.raw.toFixed(2)} TB`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'Effective Capacity (TB)', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          beginAtZero: true,
        }
      }
    }
  });
}

function buildIopsRWChart(s) {
  const colors = getChartColors();
  const rwPoints = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const penalty = raidWritePenalty(s.raidLevel, s.diskCount, fileMB, chunkKB);
  const asaAmp = asaWriteAmplification(s.dedupRatio, s.compressionRatio, s.asaOverhead);

  const raidData = rwPoints.map(r => {
    const rFrac = r / 100;
    const wFrac = 1 - rFrac;
    const readIOPS = raidEffectiveReadIOPS(s.raidLevel, s.diskCount, s.diskIOPS) * rFrac;
    const writeIOPS = raidEffectiveWriteIOPS(s.diskCount, s.diskIOPS, penalty) * wFrac;
    return readIOPS + writeIOPS;
  });

  const asaData = rwPoints.map(r => {
    const rFrac = r / 100;
    const wFrac = 1 - rFrac;
    const readIOPS = s.diskCount * s.diskIOPS * rFrac;
    const writeIOPS = asaEffectiveWriteIOPS(s.diskCount, s.diskIOPS, s.dedupRatio, s.compressionRatio, s.asaOverhead) * wFrac;
    return readIOPS + writeIOPS;
  });

  const labels = rwPoints.map(r => `${r}% R`);

  if (charts.iopsRW) charts.iopsRW.destroy();
  const ctx = document.getElementById('chartIopsRW').getContext('2d');
  const defaults = chartDefaults(colors);
  charts.iopsRW = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `RAID-${s.raidLevel}`,
          data: raidData,
          borderColor: colors.raid,
          backgroundColor: colors.raid + '18',
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 2,
        },
        {
          label: 'ASA',
          data: asaData,
          borderColor: colors.asa,
          backgroundColor: colors.asa + '18',
          fill: true,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 2,
        }
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: colors.text,
            font: { family: 'JetBrains Mono', size: 9 },
            boxWidth: 16,
            padding: 8,
          }
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${formatNum(ctx.raw)} IOPS`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'Effective IOPS', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          beginAtZero: true,
        }
      }
    }
  });
}

// ── KPI UPDATE ───────────────────────────────────────────────

function updateKPIs(s) {
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const rw = s.rwRatio / 100;

  const penalty = raidWritePenalty(s.raidLevel, s.diskCount, fileMB, chunkKB);
  const usableFrac = raidUsableFraction(s.raidLevel, s.diskCount);
  const asaMult = asaCapacityMultiplier(s.dedupRatio, s.compressionRatio, s.asaOverhead);
  const asaAmp = asaWriteAmplification(s.dedupRatio, s.compressionRatio, s.asaOverhead);
  const raidW = raidEffectiveWriteIOPS(s.diskCount, s.diskIOPS, penalty);
  const asaW = asaEffectiveWriteIOPS(s.diskCount, s.diskIOPS, s.dedupRatio, s.compressionRatio, s.asaOverhead);
  const breakeven = computeBreakevenDiskCount(s.raidLevel, s.diskIOPS, s.diskBW, s.diskLatUs, fileMB, chunkKB, s.dedupRatio, s.compressionRatio, s.asaOverhead);

  document.getElementById('kpiWritePenalty').textContent = penalty.toFixed(2) + '×';
  document.getElementById('kpiWritePenaltySub').textContent = `RAID-${s.raidLevel} at ${fileMB >= 1024 ? (fileMB/1024)+'GB' : fileMB+'MB'} file`;
  document.getElementById('kpiUsable').textContent = (usableFrac * 100).toFixed(0) + '%';
  document.getElementById('kpiUsableSub').textContent = `${s.diskCount - (s.raidLevel === 10 ? s.diskCount/2 : s.raidLevel === 6 ? 2 : 1)} of ${s.diskCount} data disks`;
  document.getElementById('kpiAsaEff').textContent = asaMult.toFixed(1) + '×';
  document.getElementById('kpiAsaEffSub').textContent = `${s.dedupRatio.toFixed(1)}× dedup × ${s.compressionRatio.toFixed(1)}× compress`;
  document.getElementById('kpiBreakeven').textContent = typeof breakeven === 'number' ? breakeven + ' disks' : breakeven;
  document.getElementById('kpiBreakevenSub').textContent = asaW > raidW
    ? '▲ ASA wins at this disk count'
    : '▼ RAID wins at this disk count';
  document.getElementById('kpiWriteIOPS').textContent = formatNum(raidW) + ' / ' + formatNum(asaW);
}

// ── FORMULA REFERENCE ─────────────────────────────────────────

function updateFormulaGrid(s) {
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const penalty = raidWritePenalty(s.raidLevel, s.diskCount, fileMB, chunkKB);
  const parityDisks = s.raidLevel === 6 ? 2 : s.raidLevel === 5 ? 1 : 0;
  const dataDisks = s.raidLevel === 10 ? s.diskCount / 2 : s.diskCount - parityDisks;
  const stripeWidthMB = (chunkKB / 1024) * dataDisks;
  const fullFrac = Math.min(1, fileMB / stripeWidthMB);
  const asaAmp = asaWriteAmplification(s.dedupRatio, s.compressionRatio, s.asaOverhead);
  const usableFrac = raidUsableFraction(s.raidLevel, s.diskCount);
  const asaMult = asaCapacityMultiplier(s.dedupRatio, s.compressionRatio, s.asaOverhead);
  const raidReadIOPS = raidEffectiveReadIOPS(s.raidLevel, s.diskCount, s.diskIOPS);
  const raidWriteIOPS = raidEffectiveWriteIOPS(s.diskCount, s.diskIOPS, penalty);
  const asaWriteIOPS = asaEffectiveWriteIOPS(s.diskCount, s.diskIOPS, s.dedupRatio, s.compressionRatio, s.asaOverhead);

  const formulas = [
    {
      name: 'RAID-5/6 Small Write Penalty',
      expr: 'W_pen = 4 (R5) | 6 (R6)',
      result: `Current: ${penalty.toFixed(2)}×`,
      note: `Read-modify-write: old data + old parity + new data + new parity. RAID-6 adds Q parity.`,
    },
    {
      name: 'Full-Stripe Blend Factor',
      expr: 'β = min(1, fileSize / (chunkSize × dataDisk))',
      result: `β = ${fullFrac.toFixed(3)} (${(fullFrac*100).toFixed(0)}% full-stripe)`,
      note: `At β=1, penalty drops to 2 (full-stripe write avoids RMW).`,
    },
    {
      name: 'Blended Write Penalty',
      expr: 'W_pen_eff = W_small(1-β) + W_full×β',
      result: `${penalty.toFixed(3)} I/Os/write`,
      note: `Patterson et al., RAID (1988). Validated by Leventhal 2009.`,
    },
    {
      name: 'RAID Usable Capacity',
      expr: 'U = (N - P) / N',
      result: `${(usableFrac*100).toFixed(1)}% of raw`,
      note: `P=1 for RAID-5, P=2 for RAID-6, P=N/2 for RAID-10.`,
    },
    {
      name: 'Effective Read IOPS',
      expr: 'RIOPS = diskIOPS × N_data',
      result: `${formatNum(raidReadIOPS)} IOPS`,
      note: `RAID-10: only N/2 mirror arms serve reads.`,
    },
    {
      name: 'Effective Write IOPS',
      expr: 'WIOPS = (diskIOPS × N) / W_pen',
      result: `${formatNum(raidWriteIOPS)} IOPS`,
      note: `Write IOPS is bottlenecked by parity computation overhead.`,
    },
    {
      name: 'ASA Write Amplification',
      expr: 'amp = (1/D)×3 + (1-1/D)×1.5 × (1+overhead)',
      result: `${asaAmp.toFixed(3)}× I/Os/write`,
      note: `D = dedup ratio. Unique chunks need 3 I/Os; duplicates need 1.5. Zhu et al., FAST 2008.`,
    },
    {
      name: 'ASA Capacity Multiplier',
      expr: 'C_eff = D × C_r × (1 - overhead)',
      result: `${asaMult.toFixed(2)}× raw capacity`,
      note: `D=dedup ratio, C_r=compression ratio. Metadata overhead subtracted.`,
    },
    {
      name: 'ASA Effective Write IOPS',
      expr: 'WIOPS_ASA = (diskIOPS × N) / amp',
      result: `${formatNum(asaWriteIOPS)} IOPS`,
      note: `No RMW penalty; cost is hash compute + unique-chunk writes.`,
    },
    {
      name: 'Stripe Width',
      expr: 'SW = chunkSize × N_data',
      result: `${stripeWidthMB >= 1 ? stripeWidthMB.toFixed(1)+'MB' : (stripeWidthMB*1024).toFixed(0)+'KB'}`,
      note: `Larger stripe = higher probability of full-stripe writes at big file sizes.`,
    },
    {
      name: 'RAID Read Throughput',
      expr: 'BW_r = N_data × diskBW × r%',
      result: `${fmtMBs(dataDisks * s.diskBW * (s.rwRatio/100))}`,
      note: `All data disks participate in reads. Reads scale linearly with N.`,
    },
    {
      name: 'ASA Chunk Hash Rate',
      expr: 'chunks/s = (BW_write × 1024) / chunkSize',
      result: `${formatNum((s.diskCount * s.diskBW * 1024 * (1-s.rwRatio/100)) / chunkKB)} chunks/s`,
      note: `SHA-256 at ~2 GB/s per core → rarely the bottleneck at HDD speeds.`,
    },
  ];

  const grid = document.getElementById('formulaGrid');
  grid.innerHTML = formulas.map(f => `
    <div class="formula-item">
      <div class="formula-name">${f.name}</div>
      <div class="formula-expr">${f.expr}</div>
      <div class="formula-result">→ ${f.result}</div>
      <div class="formula-note">${f.note}</div>
    </div>
  `).join('');
}

// ── DISK SPEC DISPLAY ────────────────────────────────────────
function updateDiskSpecsDisplay() {
  const preset = DISK_PRESETS[state.diskType];
  document.getElementById('diskSpecsDisplay').innerHTML = `
    <div class="disk-spec-item"><div class="spec-label">IOPS</div><div class="spec-val">${formatNum(state.diskIOPS)}</div></div>
    <div class="disk-spec-item"><div class="spec-label">BW</div><div class="spec-val">${state.diskBW >= 1000 ? (state.diskBW/1000).toFixed(1)+'G' : state.diskBW+'M'}/s</div></div>
    <div class="disk-spec-item"><div class="spec-label">Lat</div><div class="spec-val">${state.diskLatUs >= 1000 ? (state.diskLatUs/1000).toFixed(1)+'ms' : state.diskLatUs+'µs'}</div></div>
  `;
}

// ── RENDER ALL ───────────────────────────────────────────────

function renderAll() {
  updateKPIs(state);
  buildThroughputChart(state);
  buildWritePenaltyChart(state);
  buildLatencyChart(state);
  buildBreakevenChart(state);
  buildCapacityChart(state);
  buildIopsRWChart(state);
  updateFormulaGrid(state);
  updateDiskSpecsDisplay();
}

// ── CONTROLS WIRING ──────────────────────────────────────────

function wireSlider(id, valueId, onChange, fmt) {
  const el = document.getElementById(id);
  const valEl = valueId ? document.getElementById(valueId) : null;
  el.addEventListener('input', () => {
    const val = parseFloat(el.value);
    if (valEl) valEl.textContent = fmt ? fmt(val) : val;
    onChange(val);
    renderAll();
  });
}

function wireButtonGroup(containerId, onChange) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('.btn-seg').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-seg').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset.value);
      renderAll();
    });
  });
}

function applyDiskPreset(type) {
  const p = DISK_PRESETS[type];
  state.diskIOPS = p.iops;
  state.diskBW = p.seqBW;
  state.diskLatUs = p.latUs;
  // Update manual override sliders
  const ioSlider = document.getElementById('diskIOPS');
  const bwSlider = document.getElementById('diskBW');
  const latSlider = document.getElementById('diskLatUs');
  ioSlider.value = Math.min(p.iops, parseInt(ioSlider.max));
  bwSlider.value = Math.min(p.seqBW, parseInt(bwSlider.max));
  latSlider.value = Math.min(p.latUs, parseInt(latSlider.max));
  document.getElementById('diskIOPSVal').textContent = formatNum(state.diskIOPS) + ' IOPS';
  document.getElementById('diskBWVal').textContent = state.diskBW + ' MB/s';
  document.getElementById('diskLatUsVal').textContent = state.diskLatUs + ' µs';
}

function initControls() {
  // Disk count
  wireSlider('diskCount', 'diskCountVal', v => { state.diskCount = Math.round(v); }, v => Math.round(v));

  // RAID level
  wireButtonGroup('raidLevelGroup', v => { state.raidLevel = parseInt(v); });

  // R/W ratio
  wireSlider('rwRatio', 'rwRatioVal', v => { state.rwRatio = v; }, v => `${Math.round(v)}/${Math.round(100-v)}`);

  // File size (log index)
  wireSlider('fileSizeLog', 'fileSizeVal', v => {
    state.fileSizeIdx = Math.round(v);
  }, v => {
    const mb = FILE_SIZE_STEPS_MB[Math.round(v)];
    return mb >= 1024 ? (mb / 1024) + ' GB' : mb + ' MB';
  });

  // Disk type
  wireButtonGroup('diskTypeGroup', v => {
    state.diskType = v;
    applyDiskPreset(v);
  });

  // Chunk size (log index)
  wireSlider('chunkSize', 'chunkSizeVal', v => {
    state.chunkSizeIdx = Math.round(v);
  }, v => {
    const kb = CHUNK_SIZE_STEPS_KB[Math.round(v)];
    return kb >= 1024 ? (kb / 1024) + ' MB' : kb + ' KB';
  });

  // Dedup ratio (slider value / 10)
  wireSlider('dedupRatio', 'dedupRatioVal', v => { state.dedupRatio = v / 10; }, v => (v / 10).toFixed(1) + '×');

  // Compression ratio (slider value / 10)
  wireSlider('compressionRatio', 'compressionRatioVal', v => { state.compressionRatio = v / 10; }, v => (v / 10).toFixed(1) + '×');

  // ASA overhead
  wireSlider('asaOverhead', 'asaOverheadVal', v => { state.asaOverhead = v; }, v => v + '%');

  // Manual disk overrides
  wireSlider('diskIOPS', 'diskIOPSVal', v => { state.diskIOPS = v; }, v => formatNum(v) + ' IOPS');
  wireSlider('diskBW', 'diskBWVal', v => { state.diskBW = v; }, v => v + ' MB/s');
  wireSlider('diskLatUs', 'diskLatUsVal', v => { state.diskLatUs = v; }, v => v + ' µs');
}

// ── THEME TOGGLE ─────────────────────────────────────────────

(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);

  const setIcon = t => {
    toggle.innerHTML = t === 'dark'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  };
  setIcon(theme);

  toggle && toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    setIcon(theme);
    // Redraw charts with new colors
    setTimeout(() => renderAll(), 50);
  });
})();

// ── INIT ─────────────────────────────────────────────────────

// Set initial slider display values
document.getElementById('diskCountVal').textContent = state.diskCount;
document.getElementById('rwRatioVal').textContent = `${state.rwRatio}/${100 - state.rwRatio}`;
document.getElementById('fileSizeVal').textContent = FILE_SIZE_STEPS_MB[state.fileSizeIdx] + ' MB';
document.getElementById('chunkSizeVal').textContent = CHUNK_SIZE_STEPS_KB[state.chunkSizeIdx] + ' KB';
document.getElementById('dedupRatioVal').textContent = state.dedupRatio.toFixed(1) + '×';
document.getElementById('compressionRatioVal').textContent = state.compressionRatio.toFixed(1) + '×';
document.getElementById('asaOverheadVal').textContent = state.asaOverhead + '%';
document.getElementById('diskIOPSVal').textContent = formatNum(state.diskIOPS) + ' IOPS';
document.getElementById('diskBWVal').textContent = state.diskBW + ' MB/s';
document.getElementById('diskLatUsVal').textContent = state.diskLatUs + ' µs';

// Set slider values to match state
document.getElementById('dedupRatio').value = state.dedupRatio * 10;
document.getElementById('compressionRatio').value = state.compressionRatio * 10;

initControls();
renderAll();

// ═══════════════════════════════════════════════════════════════
//  REBUILD & VULNERABILITY WINDOW MODEL
//  References:
//   - Elerath & Pecht, "Enhanced Reliability Modeling of RAID
//     Storage Systems", DSN 2007.
//   - Greenan et al., "Reliability of Erasure Coded Storage Systems",
//     USENIX FAST 2010.
//   - Schwarz et al., "RELAX: R/W Penalty & Rebuild Analysis" IBM 2004.
//   - Hafner & Rao, "Reliability Analysis of RAID-6" IBM Almaden 2006.
//   - Disk URE rates per Seagate/WD enterprise spec sheets.
// ═══════════════════════════════════════════════════════════════

// ── REBUILD TIME ─────────────────────────────────────────────

/**
 * Rebuild time in hours for a single failed disk.
 *
 * Model: rebuild reads ALL data on surviving N-1 (RAID-5) or N-2 (RAID-6)
 * disks plus parity, and writes to the replacement. The total data read
 * is (N-1) × diskSizeTB for RAID-5/6 but effectively flows at the rate
 * of one disk being written (the replacement).
 *
 * Effective rebuild BW = min(diskBW × rebuildBWFraction, stripeBW / N)
 * because the controller can only sustain the stripe read bandwidth
 * divided by the number of disks.
 *
 * For RAID-5/6 (XOR-based):
 *   Data to reconstruct = diskSizeTB per failed disk
 *   Each stripe requires reading (N-1) chunks to XOR → so total
 *   sequential reads = (N-1) × diskSizeTB × (1 + write amplification factor)
 *   The *bottleneck* is writing the replacement: 1 disk at rebuildBW.
 *   rebuild_time = diskSizeTB / rebuildBW_effective  [per disk]
 *
 * For RAID-10 (mirror):
 *   Only need to copy 1 mirror source → diskSizeTB / rebuildBW.
 *   MUCH faster — no XOR fan-in.
 *
 * rebuildBWFraction: fraction of disk seq BW devoted to rebuild.
 * Leaves (1 - fraction) for user I/O.
 */
function rebuildTimeHours(raidLevel, diskCount, diskBW, diskSizeTB, rebuildBWFraction) {
  const rebuildBW_MBs = diskBW * rebuildBWFraction; // MB/s for rebuild

  if (raidLevel === 10) {
    // Mirror copy: just copy from surviving mirror partner
    // Effective BW = min(srcDiskBW, destDiskBW) × fraction — both at rebuildBW
    const effectiveBW = Math.min(rebuildBW_MBs, diskBW * rebuildBWFraction);
    const dataMB = diskSizeTB * 1024 * 1024; // TB → MB
    return dataMB / (effectiveBW * 3600);
  }

  // RAID-5 / RAID-6: XOR reconstruction
  // The rebuild must read from all surviving disks in each stripe.
  // I/O fan-in means the replacement disk write is the bottleneck,
  // but *each surviving disk* contributes proportionally.
  // In practice, rebuild saturates the REPLACEMENT disk write BW.
  const dataMB = diskSizeTB * 1024 * 1024; // MB to rebuild (one disk worth)

  // Overhead for RAID-6: must recompute both P and Q, ~1.4× read amplification
  const readOverhead = raidLevel === 6 ? 1.4 : 1.0;

  // Effective rebuild throughput = replacement write BW (bottleneck)
  // but also limited by (N-1) stripe-read BW shared with user I/O
  const stripeReadBW = (diskCount - 1) * diskBW;
  const rebuildContrib = stripeReadBW * rebuildBWFraction; // shared bandwidth for rebuild reads
  const bottleneckBW = Math.min(rebuildBW_MBs, rebuildContrib / readOverhead);

  return dataMB / (bottleneckBW * 3600);
}

// ── DEGRADED MODE PERFORMANCE ────────────────────────────────

/**
 * IOPS in degraded mode (one disk failed, rebuild in progress).
 *
 * RAID-5 degraded read:
 *   For any read touching the missing disk's stripe, ALL surviving
 *   disks must be read and XORed to reconstruct. This forces
 *   N-1 disk reads per reconstructed read → massive read amplification.
 *   For reads NOT hitting the missing disk (fraction (N-1)/N of data),
 *   normal performance applies.
 *   Effective read IOPS_deg = IOPS × (N-1)/N × 1 + IOPS × 1/N × (1/(N-1))
 *
 * RAID-5 degraded write (RMW):
 *   If writing to a stripe with missing disk, must update the parity
 *   using all surviving disks. Write penalty increases.
 *   Penalty increases from 4 to ~(2(N-1)) for that fraction.
 *   Approximation: 30% penalty for writes on average.
 *
 * RAID-6 degraded mode:
 *   First failure: behaves like RAID-5 degraded but uses Q-parity to
 *   avoid reading ALL disks — can reconstruct from N-2 survivors + 1 parity.
 *   Performance hit is less severe: ~15–20% degradation.
 *
 * RAID-10 degraded:
 *   Only reads from surviving mirror partner. If both partners in one mirror
 *   pair survive (i.e., failed disk's partner is alive), reads can still
 *   be served normally (partner takes all reads). Write penalty stays 2×.
 *   Degradation: reads from failed mirror arm go to partner = 50% more
 *   load on that partner. Net: ~10% IOPS reduction.
 *
 * Also subtract rebuild I/O overhead (diskIOPS × N × rebuildBWFraction).
 */
function degradedReadIOPS(raidLevel, diskCount, diskIOPS, rebuildBWFraction) {
  const totalDiskIOPS = diskCount * diskIOPS;
  const rebuildOverhead = totalDiskIOPS * rebuildBWFraction * 0.6; // rebuild uses 60% IOPS of its BW budget

  let readIOPS;
  if (raidLevel === 5) {
    const normalFrac = (diskCount - 1) / diskCount;
    const degradedFrac = 1 / diskCount;
    const normalReadIOPS = (diskCount - 1) * diskIOPS; // N-1 disks
    const degradedReadIOPSPerStripe = diskIOPS / (diskCount - 1); // reconstructed at 1/(N-1) speed
    readIOPS = normalReadIOPS * normalFrac + normalReadIOPS * degradedFrac * (1 / (diskCount - 1));
  } else if (raidLevel === 6) {
    // Q-parity reconstruction: only ~20% penalty vs RAID-5's severe degradation
    readIOPS = (diskCount - 2) * diskIOPS * 0.82;
  } else { // RAID-10
    // Surviving mirror partner handles double read load on one pair
    const mirrorPairs = diskCount / 2;
    readIOPS = (mirrorPairs - 0.5) * diskIOPS * 0.9; // one pair doing double duty
  }

  return Math.max(0, readIOPS - rebuildOverhead);
}

function degradedWriteIOPS(raidLevel, diskCount, diskIOPS, diskBW, diskSizeTB, fileSizeMB, chunkSizeKB, rebuildBWFraction) {
  const normalPenalty = raidWritePenalty(raidLevel, diskCount, fileSizeMB, chunkSizeKB);
  const totalDiskIOPS = diskCount * diskIOPS;
  const rebuildOverhead = totalDiskIOPS * rebuildBWFraction * 0.4;

  let writeIOPS;
  if (raidLevel === 5) {
    // Writes to affected stripes need to read ALL N-1 surviving disks for parity update
    const degradedPenalty = normalPenalty * 1.3; // ~30% worse
    writeIOPS = ((diskCount - 1) * diskIOPS) / degradedPenalty;
  } else if (raidLevel === 6) {
    const degradedPenalty = normalPenalty * 1.15;
    writeIOPS = ((diskCount - 2) * diskIOPS) / degradedPenalty;
  } else { // RAID-10
    // Mirror writes still go to 2 disks. One mirror pair has only 1 disk.
    // Write to that pair just writes to the survivor (no redundancy temporarily)
    writeIOPS = ((diskCount - 1) * diskIOPS) / normalPenalty;
  }

  return Math.max(0, writeIOPS - rebuildOverhead);
}

function degradedThroughputMBs(raidLevel, diskCount, diskBW, fileSizeMB, chunkSizeKB, rwFraction, rebuildBWFraction) {
  const rebuildBW = diskBW * rebuildBWFraction;
  const availBW = diskCount * diskBW - diskCount * rebuildBW;

  if (raidLevel === 10) {
    const mirrorBW = (diskCount / 2 - 0.5) * diskBW;
    const normalBW = raidThroughput(raidLevel, diskCount, diskBW, rwFraction, fileSizeMB, chunkSizeKB);
    return Math.max(0, normalBW * 0.90 - rebuildBW);
  }

  const parityDisks = raidLevel === 6 ? 2 : 1;
  const degradedDataDisks = diskCount - parityDisks - 1; // one failed + parity disks not serving user BW
  const penalty = raidWritePenalty(raidLevel, diskCount, fileSizeMB, chunkSizeKB) * (raidLevel === 5 ? 1.3 : 1.15);

  const readBW = degradedDataDisks * diskBW * rwFraction;
  const writeBW = (degradedDataDisks * diskBW * (1 - rwFraction)) / (penalty / 2);
  const userBW = readBW + writeBW;

  return Math.max(0, userBW - rebuildBW * 1.5);
}

/**
 * Normal (healthy) throughput for the same settings — used to compute % degradation.
 */
function normalThroughputMBs(raidLevel, diskCount, diskBW, fileSizeMB, chunkSizeKB, rwFraction) {
  return raidThroughput(raidLevel, diskCount, diskBW, rwFraction, fileSizeMB, chunkSizeKB);
}

// ── DOUBLE-FAULT PROBABILITY ──────────────────────────────────

/**
 * P(second disk failure during rebuild window).
 *
 * Model (Elerath & Pecht DSN 2007):
 *   During the rebuild window T_rebuild, any of the remaining (N-1)
 *   disks can fail. The failure rate per disk = AFR / (365 × 24) per hour.
 *   P(at least one more failure) = 1 - (1 - lambda × T_rebuild)^(N-1)
 *   Where lambda = hourly failure rate per disk.
 *
 * For RAID-5: any second failure = data loss.
 * For RAID-6: two more failures needed for data loss (shows separately).
 * For RAID-10: second failure only catastrophic if it hits the partner of
 *   the already-failed disk (prob = 1/(N-1)).
 *
 * We return P(catastrophic data loss) per rebuild event.
 */
function doubleFaultProb(raidLevel, diskCount, diskAFRpct, rebuildHours) {
  const lambda = (diskAFRpct / 100) / (365 * 24); // hourly failure rate per disk
  const survivingDisks = diskCount - 1;
  const pAnyFail = 1 - Math.pow(1 - lambda * rebuildHours, survivingDisks);

  if (raidLevel === 5) {
    return pAnyFail; // any second failure = data loss
  } else if (raidLevel === 6) {
    // Need TWO more failures during the rebuild of the first.
    // After first failure, we're in single-degraded state. P(second fail) = pAnyFail.
    // If second fails, now in double-degraded — P(third fail during second rebuild) matters.
    // We report P(second failure during first rebuild) as the "near-miss" metric.
    // Data loss requires BOTH second and third failures.
    const rebuildHours2 = rebuildHours * 1.15; // second rebuild slightly longer (hot spare may be slower)
    const pThirdFail = 1 - Math.pow(1 - lambda * rebuildHours2, survivingDisks - 1);
    return pAnyFail * pThirdFail; // joint probability
  } else { // RAID-10
    // Catastrophic only if partner of failed disk also fails
    const pPartnerFails = 1 - Math.pow(1 - lambda * rebuildHours, 1); // just that one partner
    return pPartnerFails;
  }
}

// ── URE RISK ─────────────────────────────────────────────────

/**
 * Probability of encountering an Unrecoverable Read Error during rebuild.
 *
 * Sectors read during rebuild = (diskSizeTB × 1024^4) / 512  (sector = 512B)
 * P(no URE) = (1 - ureRate)^sectorsRead  ≈  1 - sectorsRead × ureRate
 * P(at least one URE) = 1 - (1-ureRate)^sectorsRead
 *
 * For RAID-5: ANY URE = data loss (can't reconstruct the missing stripe).
 * For RAID-6: One URE tolerable if only one disk failed. Two UREs or second
 *   disk failure while URE present = data loss.
 *
 * Enterprise HDD: URE ~ 10^-15 per bit (or 10^-14 per sector)
 * Consumer HDD:   URE ~ 10^-14 per bit
 * Cite: Seagate Constellation specs; WD RE4 enterprise HDDs.
 */
function ureDataLossProb(raidLevel, diskCount, diskSizeTB, ureRateExponent) {
  const ureRate = Math.pow(10, -ureRateExponent); // e.g. 14 → 10^-14
  const sectorSize = 512; // bytes
  const diskSizeBytes = diskSizeTB * 1024 * 1024 * 1024 * 1024;
  const sectorsPerDisk = diskSizeBytes / sectorSize;

  // During RAID-5 rebuild, read ALL N-1 surviving disks
  const sectorsRead = (diskCount - 1) * sectorsPerDisk;

  // P(at least one URE) in N sectors = 1 - (1-p)^N ≈ N*p for small p
  const pURE = 1 - Math.pow(1 - ureRate, sectorsRead);

  if (raidLevel === 5) {
    return pURE; // any URE = data loss
  } else if (raidLevel === 6) {
    // RAID-6 can tolerate 1 URE during single-disk-failure rebuild
    // Data loss requires 2+ UREs in same stripe: P = pURE^2 × stripe_factor
    const stripes = sectorsPerDisk / 8; // ~8 sectors per stripe chunk
    // P(any stripe with 2+ UREs) using Poisson approximation
    const expectedUREs = sectorsRead * ureRate;
    const pDoubleURE = 1 - Math.exp(-expectedUREs * expectedUREs / (2 * sectorsRead));
    return Math.min(pDoubleURE, 1);
  } else { // RAID-10
    // Rebuild is a mirror copy: URE on source = data loss
    const sectorsReadMirror = sectorsPerDisk; // only read mirror source
    return 1 - Math.pow(1 - ureRate, sectorsReadMirror);
  }
}

// ── REBUILD CHART BUILDERS ───────────────────────────────────

function buildRebuildTimeChart(s) {
  const colors = getChartColors();
  const diskCounts = [];
  for (let n = 4; n <= 64; n += 2) diskCounts.push(n);
  const labels = diskCounts.map(n => n + 'd');

  const makeDataset = (level, color, dash) => ({
    label: `RAID-${level}`,
    data: diskCounts.map(n => {
      if (level === 10 && n % 2 !== 0) return null;
      return rebuildTimeHours(level, n, s.diskBW, s.diskSizeTB, s.rebuildBWFraction);
    }),
    borderColor: color,
    backgroundColor: color + '18',
    borderDash: dash || [],
    fill: false,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 4,
  });

  if (charts.rebuildTime) charts.rebuildTime.destroy();
  const ctx = document.getElementById('chartRebuildTime').getContext('2d');
  const defaults = chartDefaults(colors);

  charts.rebuildTime = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        makeDataset(5, colors.raid, []),
        makeDataset(6, colors.asa, [4, 3]),
        makeDataset(10, colors.read, [2, 2]),
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: { display: false },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw?.toFixed(1) ?? 'N/A'} hours`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'Rebuild Time (hours)', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          beginAtZero: true,
        },
        x: { ...defaults.scales.x, title: { display: true, text: 'Disk Count', color: colors.text, font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });

  document.getElementById('legendRebuild').innerHTML = `
    <div class="legend-item"><div class="legend-line" style="background:${colors.raid}"></div>RAID-5</div>
    <div class="legend-item"><div class="legend-line" style="background:${colors.asa}; opacity:0.8"></div>RAID-6</div>
    <div class="legend-item"><div class="legend-line" style="background:${colors.read}"></div>RAID-10</div>
  `;
}

function buildDegradedIOPSChart(s) {
  const colors = getChartColors();
  const diskCounts = [];
  for (let n = 4; n <= 32; n += 2) diskCounts.push(n);
  const labels = diskCounts.map(n => n + 'd');
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const rw = s.rwRatio / 100;

  const makeDataset = (level, color, solid) => {
    return {
      label: `RAID-${level}`,
      data: diskCounts.map(n => {
        if (level === 10 && n % 2 !== 0) return null;
        const normalR = raidEffectiveReadIOPS(level, n, s.diskIOPS);
        const normalW = raidEffectiveWriteIOPS(n, s.diskIOPS, raidWritePenalty(level, n, fileMB, chunkKB));
        const normal = normalR * rw + normalW * (1 - rw);
        const degR = degradedReadIOPS(level, n, s.diskIOPS, s.rebuildBWFraction);
        const degW = degradedWriteIOPS(level, n, s.diskIOPS, s.diskBW, s.diskSizeTB, fileMB, chunkKB, s.rebuildBWFraction);
        const degraded = degR * rw + degW * (1 - rw);
        return normal > 0 ? Math.round((degraded / normal) * 100) : 0;
      }),
      borderColor: color,
      backgroundColor: color + '22',
      borderDash: solid ? [] : [4, 3],
      fill: true,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 2,
    };
  };

  if (charts.degradedIOPS) charts.degradedIOPS.destroy();
  const ctx = document.getElementById('chartDegradedIOPS').getContext('2d');
  const defaults = chartDefaults(colors);

  charts.degradedIOPS = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        makeDataset(5, colors.raid, true),
        makeDataset(6, colors.asa, false),
        makeDataset(10, colors.read, true),
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: colors.text, font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 14, padding: 6 }
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw ?? 'N/A'}% of normal` }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          min: 0, max: 105,
          title: { display: true, text: '% of Normal IOPS', color: colors.text, font: { family: 'DM Sans', size: 10 } },
        }
      }
    }
  });
}

function buildRebuildContentionChart(s) {
  const colors = getChartColors();
  // Show time budget breakdown: rebuild BW vs user BW at current disk count
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const rw = s.rwRatio / 100;

  // Simulate rebuild timeline at 5 BW% points
  const bwPoints = [10, 20, 30, 40, 50, 60, 70, 80];
  const levels = [5, 6, 10];
  const levelColors = [colors.raid, colors.asa, colors.read];
  const labels = bwPoints.map(p => p + '%');

  const datasets = levels.map((lv, i) => ({
    label: `RAID-${lv} user BW`,
    data: bwPoints.map(bwPct => {
      const frac = bwPct / 100;
      const deg = degradedThroughputMBs(lv, s.diskCount, s.diskBW, fileMB, chunkKB, rw, frac);
      const norm = normalThroughputMBs(lv, s.diskCount, s.diskBW, fileMB, chunkKB, rw);
      return norm > 0 ? Math.max(0, Math.round((deg / norm) * 100)) : 0;
    }),
    borderColor: levelColors[i],
    backgroundColor: levelColors[i] + '22',
    fill: true,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 2,
    borderDash: i === 1 ? [4, 3] : [],
  }));

  if (charts.rebuildContention) charts.rebuildContention.destroy();
  const ctx = document.getElementById('chartRebuildContention').getContext('2d');
  const defaults = chartDefaults(colors);

  charts.rebuildContention = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: colors.text, font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 14, padding: 6 }
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}% throughput` }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          min: 0, max: 105,
          title: { display: true, text: '% User Throughput Remaining', color: colors.text, font: { family: 'DM Sans', size: 10 } },
        },
        x: { ...defaults.scales.x, title: { display: true, text: 'Rebuild BW Allocation (%)', color: colors.text, font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}

function buildDoubleFaultChart(s) {
  const colors = getChartColors();
  const diskCounts = [];
  for (let n = 4; n <= 64; n += 2) diskCounts.push(n);
  const labels = diskCounts.map(n => n + 'd');

  const makeDataset = (level, color, dash) => ({
    label: `RAID-${level}`,
    data: diskCounts.map(n => {
      if (level === 10 && n % 2 !== 0) return null;
      const tRebuild = rebuildTimeHours(level, n, s.diskBW, s.diskSizeTB, s.rebuildBWFraction);
      const prob = doubleFaultProb(level, n, s.diskAFR, tRebuild) * 100; // as %
      return parseFloat(prob.toExponential(2));
    }),
    borderColor: color,
    backgroundColor: color + '20',
    borderDash: dash || [],
    fill: false,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 2,
    pointHoverRadius: 5,
  });

  if (charts.doubleFault) charts.doubleFault.destroy();
  const ctx = document.getElementById('chartDoubleFault').getContext('2d');
  const defaults = chartDefaults(colors);

  charts.doubleFault = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        makeDataset(5, colors.raid),
        makeDataset(6, colors.asa, [4, 3]),
        makeDataset(10, colors.read),
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: { display: false },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw?.toFixed(4) ?? 'N/A'}% probability`
          }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          type: 'logarithmic',
          title: { display: true, text: 'P(data loss during rebuild) — log scale %', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          ticks: {
            color: colors.text,
            font: { family: 'JetBrains Mono', size: 9 },
            callback: v => v < 0.0001 ? v.toExponential(1) + '%' : v.toFixed(4) + '%'
          }
        },
        x: { ...defaults.scales.x, title: { display: true, text: 'Disk Count', color: colors.text, font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });

  document.getElementById('legendDoubleFault').innerHTML = `
    <div class="legend-item"><div class="legend-line" style="background:${colors.raid}"></div>RAID-5 (any 2nd fail)</div>
    <div class="legend-item"><div class="legend-line" style="background:${colors.asa}; opacity:0.8"></div>RAID-6 (2 add'l fails)</div>
    <div class="legend-item"><div class="legend-line" style="background:${colors.read}"></div>RAID-10 (partner fail)</div>
  `;
}

function buildURERiskChart(s) {
  const colors = getChartColors();
  const diskSizes = [1, 2, 4, 8, 12, 16, 20]; // TB
  const labels = diskSizes.map(t => t + ' TB');

  const makeDataset = (level, color, dash) => ({
    label: `RAID-${level}`,
    data: diskSizes.map(tb => {
      const prob = ureDataLossProb(level, s.diskCount, tb, s.ureRateExp) * 100;
      return Math.min(parseFloat(prob.toExponential(3)), 100);
    }),
    borderColor: color,
    backgroundColor: color + '18',
    borderDash: dash || [],
    fill: false,
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
  });

  if (charts.ureRisk) charts.ureRisk.destroy();
  const ctx = document.getElementById('chartURERisk').getContext('2d');
  const defaults = chartDefaults(colors);

  charts.ureRisk = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        makeDataset(5, colors.raid),
        makeDataset(6, colors.asa, [4, 3]),
        makeDataset(10, colors.read),
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: colors.text, font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 14, padding: 6 }
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw?.toFixed(4) ?? '—'}%` }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          type: 'logarithmic',
          title: { display: true, text: 'P(URE data loss) % — log scale', color: colors.text, font: { family: 'DM Sans', size: 10 } },
          ticks: { color: colors.text, font: { family: 'JetBrains Mono', size: 9 }, callback: v => v < 0.001 ? v.toExponential(0) + '%' : v.toFixed(3) + '%' }
        }
      }
    }
  });
}

function buildRebuildProgressChart(s) {
  const colors = getChartColors();
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const rw = s.rwRatio / 100;

  // X axis: rebuild % complete (0–100%)
  const progress = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const labels = progress.map(p => p + '%');

  const makeDataset = (level, color, dash) => {
    const norm = normalThroughputMBs(level, s.diskCount, s.diskBW, fileMB, chunkKB, rw);
    return {
      label: `RAID-${level}`,
      data: progress.map(pct => {
        // As rebuild progresses, the replaced disk gradually comes online.
        // Until ~95% complete, full degraded penalty applies.
        // From 95%→100%, performance linearly recovers.
        const recoveryFrac = Math.max(0, (pct - 95) / 5);
        const degradedBW = degradedThroughputMBs(level, s.diskCount, s.diskBW, fileMB, chunkKB, rw, s.rebuildBWFraction);
        const bw = degradedBW + (norm - degradedBW) * recoveryFrac;
        return norm > 0 ? Math.max(0, Math.round((bw / norm) * 100)) : 0;
      }),
      borderColor: color,
      backgroundColor: color + '15',
      fill: true,
      borderDash: dash || [],
      tension: 0.2,
      borderWidth: 2,
      pointRadius: 2,
    };
  };

  if (charts.rebuildProgress) charts.rebuildProgress.destroy();
  const ctx = document.getElementById('chartRebuildProgress').getContext('2d');
  const defaults = chartDefaults(colors);

  charts.rebuildProgress = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        makeDataset(5, colors.raid),
        makeDataset(6, colors.asa, [4, 3]),
        makeDataset(10, colors.read),
      ]
    },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: colors.text, font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 14, padding: 6 }
        },
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}% throughput` }
        }
      },
      scales: {
        ...defaults.scales,
        y: {
          ...defaults.scales.y,
          min: 0, max: 105,
          title: { display: true, text: '% of Normal Throughput', color: colors.text, font: { family: 'DM Sans', size: 10 } },
        },
        x: { ...defaults.scales.x, title: { display: true, text: 'Rebuild Progress', color: colors.text, font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}

// ── REBUILD KPIs ─────────────────────────────────────────────

function updateRebuildKPIs(s) {
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const rw = s.rwRatio / 100;

  const tRebuild = rebuildTimeHours(s.raidLevel, s.diskCount, s.diskBW, s.diskSizeTB, s.rebuildBWFraction);
  const norm = normalThroughputMBs(s.raidLevel, s.diskCount, s.diskBW, fileMB, chunkKB, rw);
  const degBW = degradedThroughputMBs(s.raidLevel, s.diskCount, s.diskBW, fileMB, chunkKB, rw, s.rebuildBWFraction);
  const normalIOPS = raidEffectiveReadIOPS(s.raidLevel, s.diskCount, s.diskIOPS) * rw
    + raidEffectiveWriteIOPS(s.diskCount, s.diskIOPS, raidWritePenalty(s.raidLevel, s.diskCount, fileMB, chunkKB)) * (1 - rw);
  const degR = degradedReadIOPS(s.raidLevel, s.diskCount, s.diskIOPS, s.rebuildBWFraction);
  const degW = degradedWriteIOPS(s.raidLevel, s.diskCount, s.diskIOPS, s.diskBW, s.diskSizeTB, fileMB, chunkKB, s.rebuildBWFraction);
  const degradedIOPS = degR * rw + degW * (1 - rw);
  const iopsPct = normalIOPS > 0 ? Math.round((degradedIOPS / normalIOPS) * 100) : 0;
  const bwPct = norm > 0 ? Math.round((degBW / norm) * 100) : 0;
  const dfProb = doubleFaultProb(s.raidLevel, s.diskCount, s.diskAFR, tRebuild);
  const ureProbPct = ureDataLossProb(s.raidLevel, s.diskCount, s.diskSizeTB, s.ureRateExp) * 100;

  // Format rebuild time
  const tHours = tRebuild;
  const tStr = tHours >= 24
    ? `${(tHours / 24).toFixed(1)}d ${Math.round(tHours % 24)}h`
    : `${tHours.toFixed(1)} hr`;

  document.getElementById('kpiRebuildTime').textContent = tStr;
  document.getElementById('kpiRebuildTimeSub').textContent =
    `RAID-${s.raidLevel} · ${s.diskSizeTB}TB disk · ${(s.rebuildBWFraction*100).toFixed(0)}% BW`;

  document.getElementById('kpiDegradedIOPS').textContent = formatNum(degradedIOPS);
  document.getElementById('kpiDegradedIOPSSub').textContent = `${iopsPct}% of normal (${formatNum(normalIOPS)})`;

  document.getElementById('kpiDegradedBW').textContent = fmtMBs(degBW);
  document.getElementById('kpiDegradedBWSub').textContent = `${bwPct}% of normal (${fmtMBs(norm)})`;

  // Double-fault: format as scientific notation % with color class
  const dfPct = dfProb * 100;
  document.getElementById('kpiDoubleFault').textContent =
    dfPct < 0.00001 ? dfPct.toExponential(2) + '%' : dfPct.toFixed(4) + '%';
  document.getElementById('kpiDoubleFaultSub').textContent =
    `P(data loss) per rebuild event · ${tStr} window`;

  document.getElementById('kpiURERisk').textContent =
    ureProbPct < 0.001 ? ureProbPct.toExponential(2) + '%' : ureProbPct.toFixed(3) + '%';
  document.getElementById('kpiURERiskSub').textContent =
    `10^-${s.ureRateExp} URE rate · ${s.diskSizeTB}TB disks`;

  // Risk banner logic
  const banner = document.getElementById('riskBanner');
  const bannerText = document.getElementById('riskBannerText');
  const shouldWarn = (s.raidLevel === 5 && s.diskCount >= 12 && s.diskSizeTB >= 8)
    || (dfPct > 0.01)
    || (tRebuild > 48);

  if (shouldWarn) {
    banner.style.display = 'flex';
    if (s.raidLevel === 5 && s.diskSizeTB >= 8 && s.diskCount >= 12) {
      bannerText.textContent = `RAID-5 with ${s.diskCount} × ${s.diskSizeTB}TB disks: rebuild takes ${tStr} and reads ${((s.diskCount - 1) * s.diskSizeTB).toFixed(0)} TB. URE risk is substantial — consider RAID-6 or periodic scrubs.`;
    } else if (dfPct > 0.01) {
      bannerText.textContent = `Double-fault probability exceeds 0.01% for this configuration. Each rebuild event carries material data loss risk.`;
    } else if (tRebuild > 48) {
      bannerText.textContent = `Rebuild time exceeds 48 hours. Extended vulnerability window significantly increases double-fault exposure.`;
    }
  } else {
    banner.style.display = 'none';
  }
}

// ── REBUILD FORMULA GRID ─────────────────────────────────────

function updateRebuildFormulaGrid(s) {
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const tRebuild = rebuildTimeHours(s.raidLevel, s.diskCount, s.diskBW, s.diskSizeTB, s.rebuildBWFraction);
  const dfProb = doubleFaultProb(s.raidLevel, s.diskCount, s.diskAFR, tRebuild);
  const ureProb = ureDataLossProb(s.raidLevel, s.diskCount, s.diskSizeTB, s.ureRateExp);
  const lambda = (s.diskAFR / 100) / (365 * 24);
  const sectorsPerDisk = (s.diskSizeTB * 1024 * 1024 * 1024 * 1024) / 512;
  const sectorsRead = (s.diskCount - 1) * sectorsPerDisk;
  const rebuildBW = s.diskBW * s.rebuildBWFraction;

  const formulas = [
    {
      name: 'Rebuild Time (RAID-5/6)',
      expr: 'T = diskSize_MB / min(BW_rebuild, stripeReadBW × bwFrac)',
      result: `${tRebuild.toFixed(2)} hrs`,
      note: 'Replacement disk write is the bottleneck. RAID-6 adds 1.4× read overhead for Q parity recomputation.',
    },
    {
      name: 'Rebuild Time (RAID-10)',
      expr: 'T = diskSize_MB / BW_mirror_copy',
      result: `${rebuildTimeHours(10, s.diskCount, s.diskBW, s.diskSizeTB, s.rebuildBWFraction).toFixed(2)} hrs`,
      note: 'Mirror rebuild: copy from surviving partner only. Much faster — no XOR fan-in from N-1 disks.',
    },
    {
      name: 'Rebuild BW Budget',
      expr: 'BW_rebuild = diskBW × rebuildFrac',
      result: `${rebuildBW.toFixed(0)} MB/s (${(s.rebuildBWFraction*100).toFixed(0)}% of ${s.diskBW} MB/s)`,
      note: 'Trade-off: higher rebuild fraction shortens window but degrades user I/O.',
    },
    {
      name: 'Hourly Disk Failure Rate',
      expr: 'λ = AFR / (365 × 24)',
      result: `λ = ${lambda.toExponential(3)} / hr`,
      note: `At AFR=${s.diskAFR}%, each disk fails on average once every ${(1/lambda/8760).toFixed(0)} years.`,
    },
    {
      name: 'Double-Fault Probability (RAID-5)',
      expr: 'P = 1 − (1 − λ × T)^(N−1)',
      result: `${(dfProb * 100).toExponential(3)}%`,
      note: 'Elerath & Pecht DSN 2007. Any second failure during T_rebuild = data loss for RAID-5.',
    },
    {
      name: 'Double-Fault (RAID-6)',
      expr: 'P = P(2nd fail) × P(3rd fail during 2nd rebuild)',
      result: `${(doubleFaultProb(6, s.diskCount, s.diskAFR, tRebuild) * 100).toExponential(3)}%`,
      note: 'RAID-6 requires two additional failures for data loss. Joint probability is much lower.',
    },
    {
      name: 'Sectors Read During Rebuild',
      expr: 'S_read = (N−1) × diskSize / 512B',
      result: `${(sectorsRead / 1e9).toFixed(2)}B sectors`,
      note: `At 10^-${s.ureRateExp} URE rate, expected UREs = ${(sectorsRead * Math.pow(10, -s.ureRateExp)).toFixed(2)}.`,
    },
    {
      name: 'URE Data Loss Probability',
      expr: 'P_ure = 1 − (1 − URE)^S_read',
      result: `${(ureProb * 100).toExponential(3)}%`,
      note: `RAID-5: any URE = data loss. RAID-6: tolerates 1 URE if only 1 disk failed. Seagate/WD enterprise specs.`,
    },
    {
      name: 'RAID-5 Degraded Read IOPS',
      expr: 'RIOPS_deg = R_normal × (N-1)/N + R_normal/(N-1) × 1/N',
      result: `${formatNum(degradedReadIOPS(5, s.diskCount, s.diskIOPS, s.rebuildBWFraction))} IOPS`,
      note: 'Stripes touching failed disk must be reconstructed by reading ALL N-1 survivors.',
    },
    {
      name: 'RAID-10 Degraded Mode',
      expr: 'Partner handles double read load; write penalty unchanged at 2×',
      result: `~90% IOPS retained`,
      note: 'Fastest recovery, lowest degradation. RAID-10 is rebuild-time champion at equal disk count.',
    },
    {
      name: 'Rebuild I/O Contention Factor',
      expr: 'C = rebuildBW / (N × diskBW)',
      result: `${((s.rebuildBWFraction * s.diskBW) / (s.diskCount * s.diskBW) * 100).toFixed(1)}% of array BW consumed`,
      note: 'Rebuild reads from all N-1 surviving disks; each contributes proportionally to rebuild I/O pressure.',
    },
    {
      name: 'RAID-6 URE Tolerance',
      expr: 'P_loss ≈ P(URE)² / (2 × N_stripes)',
      result: `${(ureDataLossProb(6, s.diskCount, s.diskSizeTB, s.ureRateExp) * 100).toExponential(3)}% (vs ${(ureDataLossProb(5, s.diskCount, s.diskSizeTB, s.ureRateExp) * 100).toExponential(3)}% for R5)`,
      note: 'RAID-6 reduces URE data loss risk by orders of magnitude vs RAID-5 for large drives.',
    },
  ];

  const grid = document.getElementById('formulaGridRebuild');
  grid.innerHTML = formulas.map(f => `
    <div class="formula-item">
      <div class="formula-name">${f.name}</div>
      <div class="formula-expr">${f.expr}</div>
      <div class="formula-result">→ ${f.result}</div>
      <div class="formula-note">${f.note}</div>
    </div>
  `).join('');
}

// ── REBUILD RENDER ───────────────────────────────────────────

function renderRebuildTab() {
  updateRebuildKPIs(state);
  buildRebuildTimeChart(state);
  buildDegradedIOPSChart(state);
  buildRebuildContentionChart(state);
  buildDoubleFaultChart(state);
  buildURERiskChart(state);
  buildRebuildProgressChart(state);
  updateRebuildFormulaGrid(state);
}

// ── TAB SWITCHING ────────────────────────────────────────────

(function () {
  let rebuildRendered = false;
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
      document.getElementById('tab-' + tabId).classList.remove('hidden');
      if (tabId === 'rebuild') {
        // Lazy-render rebuild charts on first visit, then re-render on subsequent
        renderRebuildTab();
        rebuildRendered = true;
      }
    });
  });
})();

// ── EXTEND STATE FOR REBUILD ─────────────────────────────────
state.diskSizeTB = 4;
state.rebuildBWFraction = 0.30;
state.ureRateExp = 14;    // 10^-14 per sector
state.diskAFR = 2;        // 2%

// ── EXTEND RENDERALL TO INCLUDE REBUILD IF VISIBLE ──────────
const _origRenderAll = renderAll;
window.renderAll = function () {
  _origRenderAll();
  const rebuildTab = document.getElementById('tab-rebuild');
  if (rebuildTab && !rebuildTab.classList.contains('hidden')) {
    renderRebuildTab();
  }
};

// ── WIRE REBUILD CONTROLS ────────────────────────────────────
(function () {
  function wireR(id, valId, stateProp, fmt, transform) {
    const el = document.getElementById(id);
    const valEl = valId ? document.getElementById(valId) : null;
    if (!el) return;
    el.addEventListener('input', () => {
      const raw = parseFloat(el.value);
      const val = transform ? transform(raw) : raw;
      state[stateProp] = val;
      if (valEl) valEl.textContent = fmt ? fmt(raw) : val;
      renderAll();
    });
  }

  wireR('diskSizeTB', 'diskSizeTBVal', 'diskSizeTB',
    v => v + ' TB', null);

  wireR('rebuildBWPct', 'rebuildBWPctVal', 'rebuildBWFraction',
    v => v + '%', v => v / 100);

  wireR('ureRate', 'ureRateVal', 'ureRateExp',
    v => `10<sup>-${Math.round(v)}</sup>`, v => Math.round(v));

  wireR('diskAFR', 'diskAFRVal', 'diskAFR',
    v => v + '%', null);
})();

// ════════════════════════════════════════════════════════════
//  v3 — CORRECTNESS COST LAYER
//  Three-baseline model: RAID bare / RAID+Correctness / ASA
//  All overhead accounting is symmetric: RAID correctness
//  infrastructure is costed honestly before comparing to ASA.
// ════════════════════════════════════════════════════════════

// ── STATE EXTENSIONS ────────────────────────────────────────
state.journalIOFrac    = 0.15;   // journal I/O as fraction of write IOPS
state.replicaFactor    = 1.0;    // quorum fan-out multiplier (1.0 = no replication)
state.scrubBWPct       = 0.05;   // background scrub as fraction of total array BW
state.reconcileFreq    = 2;      // 0=Never 1=Quarterly 2=Monthly 3=Biweekly 4=Weekly
state.coordStateIOPS   = 0.02;   // lease/fencing overhead as fraction of total IOPS

// ── CORRECTNESS MATH ────────────────────────────────────────

/* Reconcile frequency → GB scanned per day */
const RECONCILE_FREQ_LABEL = ['Never', 'Quarterly', 'Monthly', 'Biweekly', 'Weekly'];
const RECONCILE_PERIODS_DAYS = [Infinity, 90, 30, 14, 7];

/**
 * Write amplification from RAID mechanics alone (no correctness overhead).
 * Patterson et al. RAID-5: 4 I/Os per write (read-modify-write).
 */
function raidBareAmplification(s) {
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  return raidWritePenalty(s.raidLevel, s.diskCount, fileMB, chunkKB);
}

/**
 * Additional write amplification from correctness infrastructure:
 *  - Journal I/O: each write generates a journal record → +journalIOFrac × writeIOPS
 *  - Replica factor: quorum fan-out multiplies write path
 *  - Coord state: lease/fencing adds coordStateIOPS fraction to all I/O
 * Returns additive amplification factor (e.g. 0.35 = 35% extra on top of bare)
 */
function raidCorrectnessAdditionalAmp(s) {
  const journal = s.journalIOFrac;                       // e.g. 0.15
  const replica  = s.replicaFactor - 1.0;               // 0 if no replication beyond bare RAID
  const coord    = s.coordStateIOPS;                     // e.g. 0.02
  return journal + replica + coord;
}

/**
 * Full effective write amplification for RAID+Correctness baseline.
 */
function raidFullAmplification(s) {
  return raidBareAmplification(s) * (1 + raidCorrectnessAdditionalAmp(s));
}

/**
 * ASA effective write amplification.
 * ASA hashes content → idempotent writes → journal overhead ≈ 0 (full credit).
 * Coordination scope is segment-level vs volume-level → ~60% reduction.
 * Scrub is hash re-verify (~40% cheaper). Net: starts from asaWriteAmp then applies credits.
 */
function asaCorrectnessAmp(s) {
  const baseAmp = asaWriteAmplification(s.dedupRatio, s.compressionRatio, s.asaOverhead);
  // Journal credit: idempotent content-addressed writes → full journal credit
  const journalCredit = s.journalIOFrac;
  // Coord scope credit: segment-level locking → 60% of coord overhead eliminated
  const coordCredit = s.coordStateIOPS * 0.60;
  // Net ASA amp (cannot go below 0.5 × baseAmp — actual storage writes still happen)
  const netAmp = baseAmp * Math.max(0.5, 1 - journalCredit * 0.7 - coordCredit);
  return netAmp;
}

/**
 * Background scrub bandwidth consumed (MB/s).
 * RAID: reads full array periodically → scrubBWPct × (diskCount × diskBW)
 * ASA: hash re-verify is cheaper (~40% of RAID scrub) → 0.6× credit
 */
function scrubBackgroundBW(s, isASA) {
  const disk = DISK_PRESETS[s.diskType];
  const totalArrayBW = s.diskCount * disk.seqBW;
  const raidScrub = s.scrubBWPct * totalArrayBW;
  return isASA ? raidScrub * 0.6 : raidScrub;
}

/**
 * Reconciliation scan cost in GB per scan event.
 * RAID: full array scan O(data) = diskCount × diskSizeTB × 1024 GB
 * ASA: fingerprint index diff O(index) ≈ asaOverhead% of data ≈ 2-3%
 * Returns { raidGB, asaGB }
 */
function reconcileScanGB(s) {
  const arrayGB = s.diskCount * s.diskSizeTB * 1024; // raw array size in GB
  const raidGB  = arrayGB;                            // full scan
  const asaGB   = arrayGB * (s.asaOverhead / 100);   // index diff only
  return { raidGB, asaGB };
}

/**
 * Effective IOPS after correctness overhead at a given disk count n.
 * Used for shifted breakeven calculation.
 */
function iopsAtCount(n, s, mode) {
  // mode: 'bare' | 'corr' | 'asa'
  const disk = DISK_PRESETS[s.diskType];
  const fileMB = FILE_SIZE_STEPS_MB[s.fileSizeIdx];
  const chunkKB = CHUNK_SIZE_STEPS_KB[s.chunkSizeIdx];
  const rwFrac = s.rwRatio / 100;
  const wFrac  = 1 - rwFrac;

  // RAID read IOPS (same for bare/corr)
  const raidReadIOPS  = n * disk.iops * rwFrac;
  const raidWritePen  = raidWritePenalty(s.raidLevel, n, fileMB, chunkKB);

  // ASA net IOPS using existing model
  const asaReadIOPS   = n * disk.iops * rwFrac * (1 + (s.dedupRatio - 1) * 0.8);
  const asaWriteAmpV  = asaWriteAmplification(s.dedupRatio, s.compressionRatio, s.asaOverhead);
  const asaWriteIOPS  = (n * disk.iops * wFrac) / asaWriteAmpV;

  if (mode === 'bare') {
    const raidWriteIOPS = (n * disk.iops * wFrac) / raidWritePen;
    return raidReadIOPS * rwFrac + raidWriteIOPS * wFrac;
  }
  if (mode === 'corr') {
    const corrAmp = raidWritePenalty(s.raidLevel, n, fileMB, chunkKB) * (1 + raidCorrectnessAdditionalAmp(s));
    const corrWriteIOPS = (n * disk.iops * wFrac) / corrAmp;
    // subtract coord state overhead from total IOPS
    const gross = raidReadIOPS * rwFrac + corrWriteIOPS * wFrac;
    return gross * (1 - s.coordStateIOPS);
  }
  if (mode === 'asa') {
    return asaReadIOPS * rwFrac + asaWriteIOPS * wFrac;
  }
  return 0;
}

/**
 * Find disk count where ASA overtakes RAID baseline.
 * useCorrectness=false → compare to RAID bare
 * useCorrectness=true  → compare to RAID+Correctness
 */
function corrBreakevenDiskCount(s, useCorrectness) {
  for (let n = 4; n <= 64; n++) {
    const raidIops = iopsAtCount(n, s, useCorrectness ? 'corr' : 'bare');
    const asaIops  = iopsAtCount(n, s, 'asa');
    if (asaIops > raidIops) return n;
  }
  return 64; // no crossover found
}

// ── CHART BUILDERS ───────────────────────────────────────────

function buildCorrBreakdownChart(s) {
  const colors = getChartColors();
  const ctx = document.getElementById('chartCorrBreakdown');
  if (!ctx) return;
  if (charts.corrBreakdown) { charts.corrBreakdown.destroy(); }

  const bare  = raidBareAmplification(s);
  const addl  = raidCorrectnessAdditionalAmp(s);
  const journal = s.journalIOFrac * bare;
  const replica = (s.replicaFactor - 1.0) * bare;
  const coord   = s.coordStateIOPS * bare;
  const asaAmp  = asaCorrectnessAmp(s);

  charts.corrBreakdown = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['RAID (bare)', 'RAID + Journal', 'RAID + Replica', 'RAID + Coord', 'RAID+Corr (total)', 'ASA'],
      datasets: [{
        label: 'Base write amplification',
        data: [bare, bare, bare, bare, bare, asaAmp * 0.85],
        backgroundColor: colors.chart1 + 'cc',
        stack: 'amp',
      }, {
        label: 'Journal overhead',
        data: [0, journal, 0, 0, journal, 0],
        backgroundColor: colors.chart3 + 'cc',
        stack: 'amp',
      }, {
        label: 'Replica fan-out',
        data: [0, 0, replica, 0, replica, 0],
        backgroundColor: colors.chart4 + 'cc',
        stack: 'amp',
      }, {
        label: 'Coord/lease state',
        data: [0, 0, 0, coord, coord, asaAmp * 0.15],
        backgroundColor: colors.chart5 + 'cc',
        stack: 'amp',
      }],
    },
    options: {
      ...chartDefaults(colors),
      plugins: {
        ...chartDefaults(colors).plugins,
        title: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}×`
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: colors.grid } },
        y: {
          stacked: true,
          title: { display: true, text: 'Write Amplification (×)', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } },
          grid: { color: colors.grid },
        }
      }
    }
  });
}

function buildCorrIOPS3Chart(s) {
  const colors = getChartColors();
  const ctx = document.getElementById('chartCorrIOPS3');
  if (!ctx) return;
  if (charts.corrIOPS3) { charts.corrIOPS3.destroy(); }

  const counts = [4, 6, 8, 10, 12, 16, 20, 24, 32];
  const bareData = counts.map(n => iopsAtCount(n, s, 'bare'));
  const corrData = counts.map(n => iopsAtCount(n, s, 'corr'));
  const asaData  = counts.map(n => iopsAtCount(n, s, 'asa'));

  charts.corrIOPS3 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: counts.map(n => n + ' disks'),
      datasets: [
        {
          label: 'RAID (bare)',
          data: bareData,
          borderColor: colors.chart1,
          backgroundColor: colors.chart1 + '22',
          borderWidth: 2,
          borderDash: [6, 3],
          tension: 0.3,
          fill: false,
        },
        {
          label: 'RAID + Correctness',
          data: corrData,
          borderColor: colors.chart3,
          backgroundColor: colors.chart3 + '22',
          borderWidth: 2.5,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'ASA',
          data: asaData,
          borderColor: colors.chart2,
          backgroundColor: colors.chart2 + '33',
          borderWidth: 2.5,
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: {
      ...chartDefaults(colors),
      plugins: {
        ...chartDefaults(colors).plugins,
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatNum(Math.round(ctx.parsed.y))} IOPS` } }
      },
      scales: {
        x: { ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: colors.grid } },
        y: {
          title: { display: true, text: 'Effective IOPS', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 }, callback: v => formatNum(v) },
          grid: { color: colors.grid },
        }
      }
    }
  });
}

function buildCorrBreakevenChart(s) {
  const colors = getChartColors();
  const ctxEl = document.getElementById('chartCorrBreakeven');
  if (!ctxEl) return;
  if (charts.corrBreakeven) { charts.corrBreakeven.destroy(); }

  // For a range of replicaFactor and journalIOFrac permutations, show breakeven shift
  const counts = Array.from({ length: 61 }, (_, i) => i + 4);
  const bareData = counts.map(n => iopsAtCount(n, s, 'bare'));
  const corrData = counts.map(n => iopsAtCount(n, s, 'corr'));
  const asaData  = counts.map(n => iopsAtCount(n, s, 'asa'));

  const beBare = corrBreakevenDiskCount(s, false);
  const beCorr = corrBreakevenDiskCount(s, true);

  // Legend
  const legendEl = document.getElementById('legendCorrBreakeven');
  if (legendEl) {
    legendEl.innerHTML = `
      <div class="legend-item"><span class="legend-swatch" style="background:${colors.chart1};opacity:0.6;border-style:dashed"></span>RAID bare</div>
      <div class="legend-item"><span class="legend-swatch" style="background:${colors.chart3}"></span>RAID + Correctness</div>
      <div class="legend-item"><span class="legend-swatch" style="background:${colors.chart2}"></span>ASA</div>
      <div class="legend-item" style="margin-left:1rem"><span style="color:${colors.chart1}">▼ Bare breakeven: ${beBare} disks</span></div>
      <div class="legend-item"><span style="color:${colors.chart3}">▼ Honest breakeven: ${beCorr} disks</span></div>
    `;
  }

  charts.corrBreakeven = new Chart(ctxEl, {
    type: 'line',
    data: {
      labels: counts,
      datasets: [
        {
          label: 'RAID (bare)',
          data: bareData,
          borderColor: colors.chart1,
          borderWidth: 1.5,
          borderDash: [5, 4],
          tension: 0.3,
          fill: false,
          pointRadius: 0,
        },
        {
          label: 'RAID + Correctness',
          data: corrData,
          borderColor: colors.chart3,
          borderWidth: 2.5,
          tension: 0.3,
          fill: false,
          pointRadius: 0,
        },
        {
          label: 'ASA',
          data: asaData,
          borderColor: colors.chart2,
          borderWidth: 2.5,
          tension: 0.3,
          fill: { target: '-1', above: colors.chart2 + '18' },
          pointRadius: 0,
        },
      ],
    },
    options: {
      ...chartDefaults(colors),
      plugins: {
        ...chartDefaults(colors).plugins,
        annotation: undefined,
        tooltip: {
          callbacks: {
            title: ctx => `${ctx[0].parsed.x} disks`,
            label: ctx => ` ${ctx.dataset.label}: ${formatNum(Math.round(ctx.parsed.y))} IOPS`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Disk count', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 },
            callback: (v, i) => counts[i] % 8 === 0 ? counts[i] : '' },
          grid: { color: colors.grid },
        },
        y: {
          title: { display: true, text: 'Effective IOPS', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 }, callback: v => formatNum(v) },
          grid: { color: colors.grid },
        }
      }
    }
  });
}

function buildCorrBackgroundChart(s) {
  const colors = getChartColors();
  const ctx = document.getElementById('chartCorrBackground');
  if (!ctx) return;
  if (charts.corrBackground) { charts.corrBackground.destroy(); }

  const disk = DISK_PRESETS[s.diskType];
  const diskCounts = [4, 8, 12, 16, 20, 24];

  const raidScrub = diskCounts.map(n => {
    const tmp = { ...s, diskCount: n };
    return scrubBackgroundBW(tmp, false);
  });
  const asaScrub = diskCounts.map(n => {
    const tmp = { ...s, diskCount: n };
    return scrubBackgroundBW(tmp, true);
  });
  const raidCoord = diskCounts.map(n => {
    return n * disk.iops * s.coordStateIOPS * 4 / 1024; // coord IOPS × 4KB block → MB/s equivalent
  });
  const asaCoord = diskCounts.map(n => {
    return n * disk.iops * s.coordStateIOPS * 0.40 * 4 / 1024;
  });

  charts.corrBackground = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: diskCounts.map(n => n + ' disks'),
      datasets: [
        {
          label: 'RAID scrub BW',
          data: raidScrub,
          backgroundColor: colors.chart1 + 'bb',
          stack: 'raid',
        },
        {
          label: 'RAID coord I/O',
          data: raidCoord,
          backgroundColor: colors.chart5 + 'bb',
          stack: 'raid',
        },
        {
          label: 'ASA scrub BW',
          data: asaScrub,
          backgroundColor: colors.chart2 + 'bb',
          stack: 'asa',
        },
        {
          label: 'ASA coord I/O',
          data: asaCoord,
          backgroundColor: colors.chart6 + 'bb',
          stack: 'asa',
        },
      ],
    },
    options: {
      ...chartDefaults(colors),
      plugins: {
        ...chartDefaults(colors).plugins,
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} MB/s` } }
      },
      scales: {
        x: { stacked: true, ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: colors.grid } },
        y: {
          stacked: true,
          title: { display: true, text: 'Background BW (MB/s)', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } },
          grid: { color: colors.grid },
        }
      }
    }
  });
}

function buildCorrCapacityChart(s) {
  const colors = getChartColors();
  const ctx = document.getElementById('chartCorrCapacity');
  if (!ctx) return;
  if (charts.corrCapacity) { charts.corrCapacity.destroy(); }

  // Capacity overhead breakdown: journal logs, coord state, scrub metadata, ASA index
  const arrayTB = s.diskCount * s.diskSizeTB;

  // RAID correctness capacity overhead (rough estimates as % of raw)
  const raidJournalPct   = s.journalIOFrac * 100 * 0.5;  // journal is write-intensive; ~half stored
  const raidReplicaPct   = (s.replicaFactor - 1.0) * 100; // extra copies
  const raidCoordPct     = s.coordStateIOPS * 100 * 0.2;  // coord state is tiny
  const raidScrubMeta    = 0.1;                            // scrub bitmap/log

  // ASA capacity overhead
  const asaIndexPct      = s.asaOverhead;                  // hash index
  const asaJournalPct    = 0;                              // journal credit
  const asaCoordPct      = s.coordStateIOPS * 100 * 0.08; // reduced coord

  charts.corrCapacity = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['RAID (bare)', 'RAID + Correctness', 'ASA'],
      datasets: [
        {
          label: 'Base (data)',
          data: [100, 100, 100],
          backgroundColor: colors.grid,
          stack: 'cap',
        },
        {
          label: 'Journal / write log',
          data: [0, raidJournalPct, asaJournalPct],
          backgroundColor: colors.chart3 + 'cc',
          stack: 'cap',
        },
        {
          label: 'Replica overhead',
          data: [0, raidReplicaPct, 0],
          backgroundColor: colors.chart4 + 'cc',
          stack: 'cap',
        },
        {
          label: 'Coord / lease state',
          data: [0, raidCoordPct, asaCoordPct],
          backgroundColor: colors.chart5 + 'cc',
          stack: 'cap',
        },
        {
          label: 'Scrub metadata / ASA index',
          data: [0, raidScrubMeta, asaIndexPct],
          backgroundColor: colors.chart2 + 'cc',
          stack: 'cap',
        },
      ],
    },
    options: {
      ...chartDefaults(colors),
      plugins: {
        ...chartDefaults(colors).plugins,
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: +${ctx.parsed.y.toFixed(2)}% of raw capacity` }
        }
      },
      scales: {
        x: { stacked: true, ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: colors.grid } },
        y: {
          stacked: true,
          title: { display: true, text: '% of raw capacity', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 }, callback: v => v + '%' },
          grid: { color: colors.grid },
        }
      }
    }
  });
}

function buildCorrReconcileChart(s) {
  const colors = getChartColors();
  const ctx = document.getElementById('chartCorrReconcile');
  if (!ctx) return;
  if (charts.corrReconcile) { charts.corrReconcile.destroy(); }

  // Show reconcile scan cost vs array size for RAID vs ASA
  const arraySizesTB = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  const periodDays = RECONCILE_PERIODS_DAYS[s.reconcileFreq];

  const raidData = arraySizesTB.map(tb => {
    if (periodDays === Infinity) return 0;
    const scanGB = tb * 1024; // full array
    return scanGB / periodDays; // GB/day
  });
  const asaData = arraySizesTB.map(tb => {
    if (periodDays === Infinity) return 0;
    const scanGB = tb * 1024 * (s.asaOverhead / 100); // index only
    return scanGB / periodDays;
  });

  // Legend
  const legendEl = document.getElementById('legendReconcile');
  if (legendEl) {
    const ratio = s.asaOverhead > 0 ? (100 / s.asaOverhead).toFixed(0) : '—';
    legendEl.innerHTML = `
      <div class="legend-item"><span class="legend-swatch" style="background:${colors.chart1}"></span>RAID: O(data) full scan</div>
      <div class="legend-item"><span class="legend-swatch" style="background:${colors.chart2}"></span>ASA: O(index) fingerprint diff — ~${ratio}× cheaper</div>
    `;
  }

  charts.corrReconcile = new Chart(ctx, {
    type: 'line',
    data: {
      labels: arraySizesTB.map(tb => tb >= 1024 ? (tb/1024).toFixed(0)+'PB' : tb+'TB'),
      datasets: [
        {
          label: 'RAID reconcile (GB/day)',
          data: raidData,
          borderColor: colors.chart1,
          backgroundColor: colors.chart1 + '22',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
        {
          label: 'ASA reconcile (GB/day)',
          data: asaData,
          borderColor: colors.chart2,
          backgroundColor: colors.chart2 + '22',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: {
      ...chartDefaults(colors),
      plugins: {
        ...chartDefaults(colors).plugins,
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].label + ' array',
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} GB/day`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Array size', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 } },
          grid: { color: colors.grid },
        },
        y: {
          title: { display: true, text: 'Reconcile I/O (GB/day)', color: colors.muted },
          ticks: { color: colors.muted, font: { family: 'JetBrains Mono', size: 11 }, callback: v => v.toFixed(0) + ' GB' },
          grid: { color: colors.grid },
        }
      }
    }
  });
}

// ── CORRECTNESS KPIs ─────────────────────────────────────────

function updateCorrKPIs(s) {
  const bareAmp   = raidBareAmplification(s);
  const fullAmp   = raidFullAmplification(s);
  const asaAmp    = asaCorrectnessAmp(s);
  const beBare    = corrBreakevenDiskCount(s, false);
  const beCorr    = corrBreakevenDiskCount(s, true);
  const shift     = beCorr - beBare;

  const { raidGB, asaGB } = reconcileScanGB(s);
  const periodDays = RECONCILE_PERIODS_DAYS[s.reconcileFreq];
  const reconcileStr = periodDays === Infinity
    ? 'No reconcile'
    : `${(raidGB).toFixed(0)} GB vs ${asaGB.toFixed(1)} GB per scan`;

  document.getElementById('kpiCorrRaidBare').textContent   = bareAmp.toFixed(2) + '×';
  document.getElementById('kpiCorrRaidFull').textContent   = fullAmp.toFixed(2) + '×';
  document.getElementById('kpiCorrRaidFullSub').textContent =
    `+${(raidCorrectnessAdditionalAmp(s) * 100).toFixed(0)}% overhead · journal+replica+coord`;
  document.getElementById('kpiCorrASA').textContent        = asaAmp.toFixed(2) + '×';
  document.getElementById('kpiCorrASASub').textContent     =
    `hash+dedup · journal credit −${(s.journalIOFrac*70).toFixed(0)}% · coord −60%`;
  document.getElementById('kpiCorrBreakevenShift').textContent =
    shift > 0 ? `+${shift} disks` : shift === 0 ? 'No shift' : `${shift} disks`;
  document.getElementById('kpiCorrBreakevenShiftSub').textContent =
    `bare: ${beBare}d → honest: ${beCorr}d · correctness moves ASA crossover earlier`;
  document.getElementById('kpiCorrReconcile').textContent  = reconcileStr;
}

// ── CORRECTNESS FORMULA GRID ─────────────────────────────────

function updateCorrFormulaGrid(s) {
  const bare   = raidBareAmplification(s);
  const addl   = raidCorrectnessAdditionalAmp(s);
  const full   = raidFullAmplification(s);
  const asa    = asaCorrectnessAmp(s);
  const { raidGB, asaGB } = reconcileScanGB(s);
  const disk   = DISK_PRESETS[s.diskType];
  const raidScrub = scrubBackgroundBW(s, false);
  const asaScrub  = scrubBackgroundBW(s, true);
  const beBare = corrBreakevenDiskCount(s, false);
  const beCorr = corrBreakevenDiskCount(s, true);

  const formulas = [
    {
      name: 'RAID Bare Write Amplification',
      expr: 'A_bare = RAID-write-penalty(level, fileSize, chunkSize)',
      result: `${bare.toFixed(3)}×`,
      note: 'Patterson et al. RAID-5: 4 I/Os per small-write RMW. RAID-6 adds Q-parity overhead. RAID-10: mirror = 2×.',
    },
    {
      name: 'Journal I/O Overhead',
      expr: 'ΔA_journal = journalFrac × A_bare',
      result: `+${(s.journalIOFrac * bare).toFixed(3)}× (${(s.journalIOFrac*100).toFixed(0)}% of writes generate a journal record)`,
      note: 'Ext4/XFS intent log, Ceph journal, ZFS ZIL. Every fsync write → intent record before data write completes.',
    },
    {
      name: 'Replica Fan-out',
      expr: 'ΔA_replica = (replicaFactor − 1) × A_bare',
      result: `+${((s.replicaFactor - 1) * bare).toFixed(3)}× (${s.replicaFactor.toFixed(1)}× quorum fan-out)`,
      note: 'Quorum-based replication (Raft, Paxos) multiplies write I/O. replicaFactor=1 = no extra replication beyond RAID.',
    },
    {
      name: 'Coordination State Overhead',
      expr: 'ΔA_coord = coordFrac × A_bare',
      result: `+${(s.coordStateIOPS * bare).toFixed(3)}× (${(s.coordStateIOPS*100).toFixed(0)}% of I/O as lease/fence ops)`,
      note: 'Volume-level lock acquisition, fencing tokens, and epoch tracking. Leventhal 2009: distributed lock overhead scales with node count.',
    },
    {
      name: 'RAID + Correctness Total Amplification',
      expr: 'A_full = A_bare × (1 + ΔA_journal + ΔA_replica + ΔA_coord) / A_bare',
      result: `${full.toFixed(3)}× (${((full/bare - 1)*100).toFixed(1)}% above bare RAID)`,
      note: 'Symmetric honest baseline. This is the correct comparison point for any distributed correctness system.',
    },
    {
      name: 'ASA Write Amplification (with credits)',
      expr: 'A_asa = A_base × max(0.5, 1 − journal_credit × 0.7 − coord_credit)',
      result: `${asa.toFixed(3)}× (journal credit saves ${(s.journalIOFrac * 0.7 * 100).toFixed(1)}%)`,
      note: 'Content-addressed idempotent writes eliminate journal overhead. Segment-level locking reduces coord scope by ~60%.',
    },
    {
      name: 'Background Scrub Bandwidth',
      expr: 'BW_scrub = scrubPct × (diskCount × diskBW)  [ASA: × 0.6]',
      result: `RAID: ${raidScrub.toFixed(1)} MB/s  |  ASA: ${asaScrub.toFixed(1)} MB/s`,
      note: 'RAID blind sector scrub must read every block. ASA hash re-verify skips blocks whose fingerprint matches → ~40% savings. Zhu et al. FAST 2008.',
    },
    {
      name: 'Reconciliation Scan Cost',
      expr: 'RAID: O(data) = diskCount × diskSizeTB × 1024 GB  |  ASA: O(index) ≈ asaOverhead%',
      result: `RAID: ${raidGB.toFixed(0)} GB/scan  |  ASA: ${asaGB.toFixed(1)} GB/scan  (${raidGB > 0 ? (raidGB/Math.max(asaGB,0.001)).toFixed(0) : '—'}× cheaper)`,
      note: 'Fingerprint index diff is O(metadata), not O(data). At 100TB+ scale, difference is 30–50× in scan I/O.',
    },
    {
      name: 'Breakeven Disk Count (RAID bare vs ASA)',
      expr: 'n* : IOPS_asa(n*) ≥ IOPS_raid_bare(n*)',
      result: `${beBare} disks (optimistic — ignores correctness infrastructure)`,
      note: 'This is the commonly cited breakeven. It understates ASA advantage by comparing against a system that cannot solve split-brain or replica divergence.',
    },
    {
      name: 'Breakeven Disk Count (RAID+Correctness vs ASA)',
      expr: 'n* : IOPS_asa(n*) ≥ IOPS_raid_corr(n*)',
      result: `${beCorr} disks (honest — correctness overhead applied to RAID baseline)`,
      note: 'ASA may add structural metadata while reducing other overhead forms. The shift from bare to honest breakeven quantifies that benefit.',
    },
  ];

  const grid = document.getElementById('formulaGridCorr');
  if (!grid) return;
  grid.innerHTML = formulas.map(f => `
    <div class="formula-item">
      <div class="formula-name">${f.name}</div>
      <div class="formula-expr">${f.expr}</div>
      <div class="formula-result">→ ${f.result}</div>
      <div class="formula-note">${f.note}</div>
    </div>
  `).join('');
}

// ── CORRECTNESS RENDER ───────────────────────────────────────

function renderCorrectnessTab() {
  updateCorrKPIs(state);
  buildCorrBreakdownChart(state);
  buildCorrIOPS3Chart(state);
  buildCorrBreakevenChart(state);
  buildCorrBackgroundChart(state);
  buildCorrCapacityChart(state);
  buildCorrReconcileChart(state);
  updateCorrFormulaGrid(state);
}

// ── WIRE CORRECTNESS SLIDERS ─────────────────────────────────
(function () {
  // Reuse wireR pattern defined in rebuild section
  function wireCorr(id, valId, stateProp, fmtDisplay, transform) {
    const el = document.getElementById(id);
    const valEl = valId ? document.getElementById(valId) : null;
    if (!el) return;
    el.addEventListener('input', () => {
      const raw = parseFloat(el.value);
      const val = transform ? transform(raw) : raw;
      state[stateProp] = val;
      if (valEl) {
        if (typeof fmtDisplay === 'function') {
          valEl.innerHTML = fmtDisplay(raw);
        } else {
          valEl.textContent = fmtDisplay !== undefined ? fmtDisplay : val;
        }
      }
      // Re-render correctness tab if visible
      const corrTab = document.getElementById('tab-correctness');
      if (corrTab && !corrTab.classList.contains('hidden')) {
        renderCorrectnessTab();
      }
    });
  }

  wireCorr('journalIOFrac', 'journalIOFracVal', 'journalIOFrac',
    v => v + '%', v => v / 100);

  wireCorr('replicaFactor', 'replicaFactorVal', 'replicaFactor',
    v => (v / 10).toFixed(1) + '×', v => v / 10);

  wireCorr('scrubBWPct', 'scrubBWPctVal', 'scrubBWPct',
    v => v + '%', v => v / 100);

  wireCorr('reconcileFreq', 'reconcileFreqVal', 'reconcileFreq',
    v => RECONCILE_FREQ_LABEL[Math.round(v)], v => Math.round(v));

  wireCorr('coordStateIOPS', 'coordStateIOPSVal', 'coordStateIOPS',
    v => v + '%', v => v / 100);

  // Set initial display values
  const jEl = document.getElementById('journalIOFracVal');
  if (jEl) jEl.textContent = '15%';
  const rEl = document.getElementById('replicaFactorVal');
  if (rEl) rEl.textContent = '1.0×';
  const sEl = document.getElementById('scrubBWPctVal');
  if (sEl) sEl.textContent = '5%';
  const rcEl = document.getElementById('reconcileFreqVal');
  if (rcEl) rcEl.textContent = 'Monthly';
  const cEl = document.getElementById('coordStateIOPSVal');
  if (cEl) cEl.textContent = '2%';
})();

// ── EXTEND TAB SWITCHING FOR CORRECTNESS ────────────────────
// NOTE: The original IIFE already handles 'performance' and 'rebuild'.
// We patch the existing tab buttons to also handle 'correctness'.
(function () {
  let correctnessRendered = false;
  // Find the correctness tab button and attach listener
  const corrBtn = document.querySelector('[data-tab="correctness"]');
  if (corrBtn) {
    corrBtn.addEventListener('click', () => {
      // renderCorrectnessTab always re-renders to pick up slider changes
      renderCorrectnessTab();
      correctnessRendered = true;
    });
  }

  // Also extend renderAll so correctness re-renders when sidebar sliders change
  const _origRenderAll2 = window.renderAll;
  window.renderAll = function () {
    _origRenderAll2();
    const corrTab = document.getElementById('tab-correctness');
    if (corrTab && !corrTab.classList.contains('hidden')) {
      renderCorrectnessTab();
    }
  };
})();

// ════════════════════════════════════════════════════════════
//  v4 — DEPLOYMENT PROFILES + DECISION METRICS
// ════════════════════════════════════════════════════════════

// ── DEPLOYMENT PROFILE DEFINITIONS ──────────────────────────
const DEPLOYMENT_PROFILES = {
  custom: {
    label: 'Custom',
    desc: 'Manually configure all parameters below.',
  },
  vsan: {
    label: 'VMware vSAN',
    desc: '12-node all-flash vSAN cluster · RAID-5 erasure coding · NVMe · moderate dedup from VM image similarity · 4TB per disk · AFR 1.5%',
    sliders: {
      diskCount: 12, raidLevel: 5, rwRatio: 65, fileSizeIdx: 5, /* 32MB */
      diskType: 'nvme', chunkSizeIdx: 3, dedupRatio: 30, compressionRatio: 15,
      asaOverhead: 3, diskSizeTB: 4, rebuildBWFraction: 0.30, diskAFR: 1.5,
      journalIOFrac: 0.12, replicaFactor: 1.0, scrubBWPct: 0.04, reconcileFreq: 2, coordStateIOPS: 0.02,
    }
  },
  nutanix: {
    label: 'Nutanix HCI',
    desc: '8-node Nutanix cluster · RAID-6 (RF3) · SATA SSD · high dedup (VDI workload) · 8TB per disk · AFR 2%',
    sliders: {
      diskCount: 8, raidLevel: 6, rwRatio: 75, fileSizeIdx: 4, /* 16MB */
      diskType: 'sata-ssd', chunkSizeIdx: 2, dedupRatio: 50, compressionRatio: 20,
      asaOverhead: 3, diskSizeTB: 8, rebuildBWFraction: 0.25, diskAFR: 2,
      journalIOFrac: 0.15, replicaFactor: 1.0, scrubBWPct: 0.05, reconcileFreq: 1, coordStateIOPS: 0.025,
    }
  },
  cloud: {
    label: 'Cloud Object Storage',
    desc: '24-node distributed object store · erasure-coded (RAID-6 equiv) · HDD · low dedup (unique blobs) · 16TB per disk · AFR 3%',
    sliders: {
      diskCount: 24, raidLevel: 6, rwRatio: 80, fileSizeIdx: 8, /* 256MB */
      diskType: 'hdd', chunkSizeIdx: 4, dedupRatio: 12, compressionRatio: 12,
      asaOverhead: 2, diskSizeTB: 16, rebuildBWFraction: 0.20, diskAFR: 3,
      journalIOFrac: 0.20, replicaFactor: 1.5, scrubBWPct: 0.06, reconcileFreq: 2, coordStateIOPS: 0.03,
    }
  },
  enterprise: {
    label: 'Enterprise HA Array',
    desc: '16-node active-active HA · RAID-10 mirror · NVMe · high dedup (backup target) · 8TB per disk · AFR 1%',
    sliders: {
      diskCount: 16, raidLevel: 10, rwRatio: 60, fileSizeIdx: 6, /* 64MB */
      diskType: 'nvme', chunkSizeIdx: 3, dedupRatio: 60, compressionRatio: 25,
      asaOverhead: 4, diskSizeTB: 8, rebuildBWFraction: 0.40, diskAFR: 1,
      journalIOFrac: 0.10, replicaFactor: 2.0, scrubBWPct: 0.03, reconcileFreq: 3, coordStateIOPS: 0.015,
    }
  },
  edge: {
    label: 'Edge Appliance',
    desc: '4-node edge cluster · RAID-5 · SATA SSD · minimal dedup (raw telemetry) · 2TB per disk · AFR 2.5%',
    sliders: {
      diskCount: 4, raidLevel: 5, rwRatio: 50, fileSizeIdx: 3, /* 8MB */
      diskType: 'sata-ssd', chunkSizeIdx: 2, dedupRatio: 12, compressionRatio: 11,
      asaOverhead: 3, diskSizeTB: 2, rebuildBWFraction: 0.35, diskAFR: 2.5,
      journalIOFrac: 0.18, replicaFactor: 1.0, scrubBWPct: 0.07, reconcileFreq: 1, coordStateIOPS: 0.02,
    }
  },
};

// Helper: fire a native input event on a slider (so wired listeners pick it up)
function fireSlider(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

// Helper: set a button-group selection
function setButtonGroup(groupId, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.btn-seg').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === String(value));
  });
  // Manually update state from the group since btn-seg listeners handle it
  if (groupId === 'raidLevelGroup') {
    state.raidLevel = Number(value);
  } else if (groupId === 'diskTypeGroup') {
    const disk = DISK_PRESETS[value];
    state.diskType = value;
    state.diskIOPS = disk.iops;
    state.diskBW = disk.seqBW;
    state.diskLatUs = disk.latUs;
    // Update manual overrides
    fireSlider('diskIOPS', disk.iops);
    fireSlider('diskBW', disk.seqBW);
    fireSlider('diskLatUs', disk.latUs);
  }
}

function applyProfile(profileKey) {
  const profile = DEPLOYMENT_PROFILES[profileKey];
  if (!profile || profileKey === 'custom') return;
  const s = profile.sliders;
  if (window._setProfileApplying) window._setProfileApplying(true);

  // Workload sliders
  fireSlider('diskCount', s.diskCount);
  fireSlider('rwRatio', s.rwRatio);
  fireSlider('fileSizeLog', s.fileSizeIdx);

  // RAID level button group
  setButtonGroup('raidLevelGroup', s.raidLevel);

  // Disk type button group
  setButtonGroup('diskTypeGroup', s.diskType);

  // ASA sliders
  fireSlider('chunkSize', s.chunkSizeIdx);
  fireSlider('dedupRatio', s.dedupRatio);
  fireSlider('compressionRatio', s.compressionRatio);
  fireSlider('asaOverhead', s.asaOverhead);

  // Rebuild sliders
  fireSlider('diskSizeTB', s.diskSizeTB);
  fireSlider('rebuildBWPct', Math.round(s.rebuildBWFraction * 100));
  fireSlider('diskAFR', s.diskAFR);

  // Correctness sliders
  fireSlider('journalIOFrac', Math.round(s.journalIOFrac * 100));
  fireSlider('replicaFactor', Math.round(s.replicaFactor * 10));
  fireSlider('scrubBWPct', Math.round(s.scrubBWPct * 100));
  fireSlider('reconcileFreq', s.reconcileFreq);
  fireSlider('coordStateIOPS', Math.round(s.coordStateIOPS * 100));

  renderAll();
  // Short timeout to let all input events settle before re-enabling custom detection
  setTimeout(() => { if (window._setProfileApplying) window._setProfileApplying(false); }, 100);
}

// Wire profile chips
(function() {
  const descEl = document.getElementById('profileDesc');
  document.getElementById('profilesGroup')?.addEventListener('click', e => {
    const chip = e.target.closest('.profile-chip');
    if (!chip) return;
    const profileKey = chip.dataset.profile;
    document.querySelectorAll('.profile-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    if (descEl) descEl.textContent = DEPLOYMENT_PROFILES[profileKey]?.desc || '';
    if (profileKey !== 'custom') applyProfile(profileKey);
  });
  // Mark 'custom' when user manually touches a slider AFTER profile is done applying
  var _profileApplying = false;
  const origApply = applyProfile;
  // Patch applyProfile to set flag
  window._setProfileApplying = function(v) { _profileApplying = v; };

  document.querySelectorAll('.slider').forEach(sl => {
    sl.addEventListener('input', () => {
      if (_profileApplying) return;
      const activeChip = document.querySelector('.profile-chip.active');
      if (activeChip && activeChip.dataset.profile !== 'custom') {
        document.querySelectorAll('.profile-chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-profile="custom"]')?.classList.add('active');
        if (descEl) descEl.textContent = DEPLOYMENT_PROFILES.custom.desc;
      }
    }, { passive: true });
  });
})();

// ── DECISION METRICS ────────────────────────────────────────

function computeDecisionMetrics(s) {
  const tRebuild = rebuildTimeHours(s.raidLevel, s.diskCount, s.diskBW, s.diskSizeTB, s.rebuildBWFraction);
  const dfProb   = doubleFaultProb(s.raidLevel, s.diskCount, s.diskAFR, tRebuild);
  const ureProb  = ureDataLossProb(s.raidLevel, s.diskCount, s.diskSizeTB, s.ureRateExp);

  // Recovery Risk Score — log-normalised combination of double-fault and URE probability
  // Scale: 0-100, higher = more risk
  const dfScore  = Math.min(100, Math.max(0, -Math.log10(Math.max(dfProb, 1e-15)) * -5 + 50));
  const ureScore = Math.min(100, Math.max(0, -Math.log10(Math.max(ureProb, 1e-15)) * -6 + 60));
  const recoveryRisk = Math.min(100, (dfScore * 0.6 + ureScore * 0.4));

  // Operational Complexity Index — write amp × correctness overhead × scrub budget
  const bareAmp   = raidBareAmplification(s);
  const fullAmp   = raidFullAmplification(s);
  const asaAmp    = asaCorrectnessAmp(s);
  // Relative to a perfect 1× baseline; capped at 10×
  const raidComplexity = Math.min(100, (fullAmp / 1.0) * 10);
  const asaComplexity  = Math.min(100, (asaAmp / 1.0) * 10);
  // Return both for display; show RAID as "current" score
  const opsComplexity  = raidComplexity;

  // Rebuild Vulnerability Window — just rebuild time in hours (already computed)
  const vulnHours = tRebuild;

  // Divergence Resolution Time — ratio RAID:ASA scan time
  const { raidGB, asaGB } = reconcileScanGB(s);
  // Assume 200 MB/s scan rate
  const scanRateMBs = 200;
  const raidResMin = (raidGB * 1024) / scanRateMBs / 60; // minutes
  const asaResMin  = (asaGB * 1024) / scanRateMBs / 60;

  return { recoveryRisk, opsComplexity, asaComplexity, vulnHours, raidResMin, asaResMin, dfProb, ureProb, fullAmp, asaAmp };
}

function riskLabel(score) {
  if (score < 25) return 'LOW';
  if (score < 55) return 'MEDIUM';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
}

function updateDecisionMetrics(s) {
  const m = computeDecisionMetrics(s);

  // Recovery Risk
  const riskEl   = document.getElementById('dmRecoveryRisk');
  const riskBar  = document.getElementById('dmRecoveryRiskBar');
  const riskNote = document.getElementById('dmRecoveryRiskNote');
  if (riskEl) {
    const label = riskLabel(m.recoveryRisk);
    riskEl.textContent = label;
    riskEl.style.color = m.recoveryRisk > 70 ? 'var(--chart-5)' :
                          m.recoveryRisk > 40 ? 'var(--chart-6)' : 'var(--chart-3)';
  }
  if (riskBar) riskBar.style.width = Math.min(100, m.recoveryRisk).toFixed(1) + '%';
  if (riskNote) riskNote.textContent =
    `Double-fault P=${(m.dfProb * 100).toExponential(1)}% · URE P=${(m.ureProb * 100).toExponential(1)}% · rebuild ${m.vulnHours.toFixed(1)}h`;

  // Operational Complexity
  const opsEl   = document.getElementById('dmOpsComplexity');
  const opsBar  = document.getElementById('dmOpsComplexityBar');
  const opsNote = document.getElementById('dmOpsComplexityNote');
  if (opsEl) {
    opsEl.textContent = m.fullAmp.toFixed(2) + '×';
    opsEl.style.color = m.fullAmp > 5 ? 'var(--chart-5)' :
                         m.fullAmp > 3 ? 'var(--chart-6)' : 'var(--chart-3)';
  }
  if (opsBar) opsBar.style.width = Math.min(100, m.opsComplexity).toFixed(1) + '%';
  if (opsNote) opsNote.textContent =
    `RAID+Corr write amp ${m.fullAmp.toFixed(2)}× vs ASA ${m.asaAmp.toFixed(2)}× — ${((m.fullAmp / m.asaAmp - 1)*100).toFixed(0)}% higher`;

  // Rebuild Vulnerability Window
  const vulnEl   = document.getElementById('dmVulnerability');
  const vulnBar  = document.getElementById('dmVulnerabilityBar');
  const vulnNote = document.getElementById('dmVulnerabilityNote');
  const vulnH = m.vulnHours;
  if (vulnEl) {
    vulnEl.textContent = vulnH < 1 ? (vulnH * 60).toFixed(0) + ' min' : vulnH.toFixed(1) + ' hrs';
    vulnEl.style.color = vulnH > 48 ? 'var(--chart-5)' :
                          vulnH > 12 ? 'var(--chart-6)' : 'var(--chart-3)';
  }
  if (vulnBar) vulnBar.style.width = Math.min(100, vulnH / 72 * 100).toFixed(1) + '%';
  if (vulnNote) vulnNote.textContent =
    `Single-disk rebuild at ${(s.rebuildBWFraction*100).toFixed(0)}% BW · ${s.diskSizeTB}TB drives · RAID-${s.raidLevel}`;

  // Divergence Resolution Time
  const divEl   = document.getElementById('dmDivergence');
  const divBar  = document.getElementById('dmDivergenceBar');
  const divNote = document.getElementById('dmDivergenceNote');
  const reconcileOff = s.reconcileFreq === 0;
  if (divEl) {
    if (reconcileOff) {
      divEl.textContent = 'N/A';
      divEl.style.color = 'var(--color-text-muted)';
    } else {
      const asaMin = m.asaResMin;
      divEl.textContent = asaMin < 60 ? asaMin.toFixed(0) + ' min' : (asaMin/60).toFixed(1) + ' hrs';
      divEl.style.color = 'var(--chart-2)';
    }
  }
  if (divBar && !reconcileOff) {
    // Show ASA as fraction of RAID scan time (how much faster)
    const ratio = Math.min(1, m.asaResMin / Math.max(m.raidResMin, 0.001));
    divBar.style.width = (ratio * 100).toFixed(1) + '%';
  }
  if (divNote) {
    if (reconcileOff) {
      divNote.textContent = 'Reconcile disabled — divergence is undetected until manual intervention.';
    } else {
      const ratio = m.raidResMin > 0 ? (m.raidResMin / Math.max(m.asaResMin, 0.001)).toFixed(0) : '—';
      divNote.textContent =
        `RAID: ${m.raidResMin < 60 ? m.raidResMin.toFixed(0)+'min' : (m.raidResMin/60).toFixed(1)+'hrs'} O(data) · ASA: ${m.asaResMin < 60 ? m.asaResMin.toFixed(0)+'min' : (m.asaResMin/60).toFixed(1)+'hrs'} O(index) · ${ratio}× faster`;
    }
  }
}

// Wire Customer Question links to tab switching
(function() {
  document.querySelectorAll('[data-goto-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tabKey = link.dataset.gotoTab;
      const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabKey}"]`);
      if (targetBtn) targetBtn.click();
      // Scroll to top of results panel
      document.querySelector('.results-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

// ── EXTEND RENDERALL TO UPDATE DECISION METRICS ─────────────
(function () {
  const _prevRenderAll = window.renderAll;
  window.renderAll = function () {
    _prevRenderAll();
    updateDecisionMetrics(state);
  };
})();

// Trigger initial decision metrics render
updateDecisionMetrics(state);

// ════════════════════════════════════════════════════════════
//  v4.1 — LAYOUT: Move controls inline below KPI strip
//  Physically relocates <aside class="controls-panel"> into
//  the results panel, right after the tab-bar, and wraps
//  all panel-sections in a horizontal scroll container.
// ════════════════════════════════════════════════════════════
(function () {
  const aside = document.getElementById('controls');
  const resultsPanel = document.querySelector('.results-panel');
  const tabBar = resultsPanel?.querySelector('.tab-bar');
  if (!aside || !resultsPanel || !tabBar) return;

  // Wrap all panel-sections in a horizontal scroll div
  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'controls-inner-scroll';

  // Wrap each panel-section's control-groups in a grid
  aside.querySelectorAll('.panel-section').forEach(section => {
    const grid = document.createElement('div');
    grid.className = 'section-controls-grid';
    // Move all control-groups into the grid
    section.querySelectorAll('.control-group').forEach(cg => grid.appendChild(cg));
    // Keep section-label, append grid
    section.appendChild(grid);
    scrollWrap.appendChild(section);
  });

  aside.innerHTML = '';
  aside.appendChild(scrollWrap);

  // Insert aside AFTER the KPI strip in the performance tab
  const kpiStrip = resultsPanel.querySelector('#tab-perf .kpi-strip');
  if (kpiStrip) {
    kpiStrip.insertAdjacentElement('afterend', aside);
  } else {
    // Fallback: insert after tab-bar if kpi-strip not found
    tabBar.insertAdjacentElement('afterend', aside);
  }
})();
