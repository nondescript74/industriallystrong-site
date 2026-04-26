/**
 * Cloudflare Pages Function — /api/telemetry
 *
 * Receives telemetry POSTs from src/utils/telemetry.js (sendTelemetry) on
 * the apex industriallystrong.com origin. Inserts each event into the same
 * D1 database / table that /api/metrics queries, so metrics counts surface
 * the events posted here.
 *
 * Required binding (set in Cloudflare Pages → Settings → Bindings):
 *   DB  –  D1 database "is-telemetry"
 *
 * Method matrix
 * -------------
 *   OPTIONS  → 204 with same-origin CORS headers (preflight friendly)
 *   GET      → 200 JSON health envelope
 *                { ok: true, endpoint: "/api/telemetry", accepts: ["POST"], db_bound: boolean }
 *   POST     → parse JSON, normalize, INSERT into pageviews, return JSON
 *                success → { ok: true, inserted: true }
 *                failure → { ok: false, error, detail }
 *   other    → 405 JSON
 *
 * Schema doctrine
 * ---------------
 * The `pageviews` table is shared with /api/metrics (which queries:
 *   SELECT COUNT(DISTINCT visitor_id) FROM pageviews WHERE ts >= ?
 *   SELECT COUNT(*)                  FROM pageviews WHERE ts >= ? AND type = 'pageview'
 *   SELECT DISTINCT visitor_id ...
 * ). So at minimum the columns `ts`, `type`, `visitor_id` must exist.
 *
 * This function attempts the FULL column set first
 * (ts, type, app, lane, route, title, referrer, referrer_source,
 * session_id, visitor_id, utm_source, utm_medium, utm_campaign,
 * utm_content, metadata). If D1 rejects it as a schema mismatch
 * ("no such column" / "table pageviews has no column ..."), the function
 * runs PRAGMA table_info(pageviews) once and retries the INSERT against
 * exactly the columns that exist. No column is guessed beyond what
 * PRAGMA reports.
 *
 * Frontend payload (src/utils/telemetry.js sendTelemetry):
 *   app, lane, event_type, route, title,
 *   referrer, referrer_source,
 *   session_id, visitor_id,
 *   metadata (object — stored as JSON string),
 *   utm_source, utm_medium, utm_campaign, utm_content
 *
 * NOTE: the frontend sends `event_type`. We map it to the `type` column
 * because metrics.js filters on `type = 'pageview'`.
 */

const ALLOWED_ORIGINS = [
  "https://industriallystrong.com",
  "https://www.industriallystrong.com",
];

// Full column set, in INSERT order. The `type` column is mapped from
// the frontend's `event_type` field. See normalizePayload below.
const FULL_COLUMNS = [
  "ts",
  "type",
  "app",
  "lane",
  "route",
  "title",
  "referrer",
  "referrer_source",
  "session_id",
  "visitor_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "metadata",
];

function buildCorsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://industriallystrong.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function jsonResponse(body, init = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...(init.headers || {}),
  };
  return new Response(JSON.stringify(body), { ...init, headers });
}

function isOriginAllowed(origin) {
  if (!origin) return true; // same-origin requests have no Origin header
  return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
}

function normalizePayload(raw) {
  // All fields default to safe empty values so the INSERT never throws on
  // missing keys. Numbers stay numeric; objects (metadata) become JSON
  // strings; everything else is coerced to string.
  const safeStr = (v) => (v == null ? "" : String(v));

  const metadataValue =
    raw.metadata == null
      ? ""
      : typeof raw.metadata === "string"
      ? raw.metadata
      : JSON.stringify(raw.metadata);

  return {
    ts: Date.now(),
    type: safeStr(raw.event_type || "pageview"),
    app: safeStr(raw.app),
    lane: safeStr(raw.lane),
    route: safeStr(raw.route),
    title: safeStr(raw.title),
    referrer: safeStr(raw.referrer),
    referrer_source: safeStr(raw.referrer_source),
    session_id: safeStr(raw.session_id),
    visitor_id: safeStr(raw.visitor_id),
    utm_source: safeStr(raw.utm_source),
    utm_medium: safeStr(raw.utm_medium),
    utm_campaign: safeStr(raw.utm_campaign),
    utm_content: safeStr(raw.utm_content),
    metadata: metadataValue,
  };
}

function buildInsertStatement(env, columns, values) {
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO pageviews (${columns.join(", ")}) VALUES (${placeholders})`;
  return env.DB.prepare(sql).bind(...values);
}

async function tryInsertFull(env, normalized) {
  const values = FULL_COLUMNS.map((col) => normalized[col]);
  await buildInsertStatement(env, FULL_COLUMNS, values).run();
}

async function inspectTableColumns(env) {
  // PRAGMA returns rows like {cid, name, type, notnull, dflt_value, pk}.
  // We only need the `name` column.
  const res = await env.DB.prepare("PRAGMA table_info(pageviews)").all();
  const rows = res?.results || [];
  return rows.map((r) => r.name).filter(Boolean);
}

async function tryInsertFiltered(env, normalized) {
  const existingCols = await inspectTableColumns(env);
  if (!existingCols.length) {
    throw new Error("pageviews table missing or PRAGMA returned no columns");
  }
  // Use only columns we have a normalized value for AND that exist in the
  // schema. No guessing.
  const usable = FULL_COLUMNS.filter((c) => existingCols.includes(c));
  if (!usable.length) {
    throw new Error(
      `pageviews schema has none of the expected columns; got [${existingCols.join(", ")}]`
    );
  }
  const values = usable.map((col) => normalized[col]);
  await buildInsertStatement(env, usable, values).run();
  return { columns_used: usable };
}

export async function onRequest(context) {
  const { env, request } = context;
  const origin = request.headers.get("Origin") || "";
  const corsHeaders = buildCorsHeaders(origin);

  // ─── OPTIONS preflight ───────────────────────────────────────────────────
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-store",
      },
    });
  }

  // ─── Same-origin enforcement (mirrors metrics.js) ────────────────────────
  if (!isOriginAllowed(origin)) {
    return jsonResponse(
      { ok: false, error: "Forbidden", detail: "origin not allowed" },
      { status: 403, headers: corsHeaders }
    );
  }

  // ─── GET health envelope ─────────────────────────────────────────────────
  if (request.method === "GET") {
    return jsonResponse(
      {
        ok: true,
        endpoint: "/api/telemetry",
        accepts: ["POST"],
        db_bound: Boolean(env.DB),
      },
      { status: 200, headers: corsHeaders }
    );
  }

  // ─── 405 for non-POST/non-GET ────────────────────────────────────────────
  if (request.method !== "POST") {
    return jsonResponse(
      { ok: false, error: "Method not allowed", detail: `method=${request.method}` },
      {
        status: 405,
        headers: { ...corsHeaders, Allow: "GET, POST, OPTIONS" },
      }
    );
  }

  // ─── POST: D1 binding required ───────────────────────────────────────────
  if (!env.DB) {
    return jsonResponse(
      { ok: false, error: "Storage unavailable", detail: "D1 binding env.DB not configured" },
      { status: 503, headers: corsHeaders }
    );
  }

  // ─── POST: parse JSON safely ─────────────────────────────────────────────
  let raw;
  try {
    raw = await request.json();
  } catch (err) {
    return jsonResponse(
      { ok: false, error: "Invalid JSON", detail: String(err?.message || err) },
      { status: 400, headers: corsHeaders }
    );
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return jsonResponse(
      { ok: false, error: "Invalid payload", detail: "expected JSON object" },
      { status: 400, headers: corsHeaders }
    );
  }

  const normalized = normalizePayload(raw);

  // ─── POST: insert with PRAGMA-driven fallback ────────────────────────────
  try {
    await tryInsertFull(env, normalized);
    return jsonResponse({ ok: true, inserted: true }, { status: 200, headers: corsHeaders });
  } catch (firstErr) {
    const msg = String(firstErr?.message || firstErr);
    // If the failure looks like a column / schema mismatch, fall back to
    // PRAGMA inspection and retry with the subset that actually exists.
    const looksLikeSchemaMismatch =
      /no such column|has no column|table pageviews has no column|cannot find column|near "/i.test(msg);

    if (!looksLikeSchemaMismatch) {
      console.error("telemetry insert failed (non-schema):", msg);
      return jsonResponse(
        { ok: false, error: "Insert failed", detail: msg },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const { columns_used } = await tryInsertFiltered(env, normalized);
      return jsonResponse(
        { ok: true, inserted: true, fallback: true, columns_used },
        { status: 200, headers: corsHeaders }
      );
    } catch (secondErr) {
      const detail = String(secondErr?.message || secondErr);
      console.error("telemetry insert failed after PRAGMA fallback:", detail);
      return jsonResponse(
        {
          ok: false,
          error: "Insert failed (schema fallback also failed)",
          detail,
          first_error: msg,
        },
        { status: 500, headers: corsHeaders }
      );
    }
  }
}
