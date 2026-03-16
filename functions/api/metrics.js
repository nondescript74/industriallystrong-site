/**
 * Cloudflare Pages Function — /api/metrics
 *
 * Queries the Cloudflare GraphQL Analytics API for today's visitor
 * and pageview data, then returns it as JSON for the LiveMetricsCard
 * component on the homepage.
 *
 * Required environment variables (set in Cloudflare Pages dashboard):
 *   CF_API_TOKEN  – API token with Zone.Analytics:Read permission
 *   CF_ZONE_ID    – Zone ID for industriallystrong.com
 */

export async function onRequest(context) {
  const { env } = context;

  const token = env.CF_API_TOKEN;
  const zoneId = env.CF_ZONE_ID;

  // --- guard: missing credentials ----------------------------------------
  if (!token || !zoneId) {
    return Response.json(
      {
        visitors_today: "—",
        pageviews_today: "—",
        first_time_visits: "—",
        returning_visits: "—",
        note: "Analytics credentials not configured.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  // --- build datetime range for "today" in UTC -----------------------------
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // "2026-03-15"
  const startOfDay = `${todayStr}T00:00:00Z`;
  const nowISO = now.toISOString();

  // --- Cloudflare GraphQL Analytics query ---------------------------------
  // Uses httpRequestsAdaptiveGroups for near-real-time data (minutes delay)
  // instead of httpRequests1dGroups which has a ~24h delay.
  const query = `
    query SiteMetrics($zoneTag: String!, $since: DateTime!, $until: DateTime!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequestsAdaptiveGroups(
            filter: {
              datetime_geq: $since
              datetime_leq: $until
              requestSource: "eyeball"
            }
            limit: 10000
          ) {
            count
            sum {
              visits
              pageViews
            }
            dimensions {
              clientIP
            }
          }
        }
      }
    }
  `;

  const variables = {
    zoneTag: zoneId,
    since: startOfDay,
    until: nowISO,
  };

  try {
    const cfRes = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!cfRes.ok) {
      const text = await cfRes.text();
      console.error("CF Analytics API error:", cfRes.status, text);
      throw new Error(`Cloudflare API returned ${cfRes.status}`);
    }

    const json = await cfRes.json();

    // Aggregate adaptive groups — each row is grouped by clientIP
    const zones = json?.data?.viewer?.zones;
    const groups =
      zones && zones.length > 0
        ? zones[0].httpRequestsAdaptiveGroups ?? []
        : [];

    if (groups.length === 0) {
      return Response.json(
        {
          visitors_today: 0,
          pageviews_today: 0,
          first_time_visits: 0,
          returning_visits: 0,
        },
        {
          headers: {
            "Cache-Control": "public, max-age=120",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Sum across all groups
    let totalPageViews = 0;
    let totalVisits = 0;
    const uniqueIPs = new Set();

    for (const g of groups) {
      totalPageViews += g.sum?.pageViews ?? 0;
      totalVisits += g.sum?.visits ?? 0;
      if (g.dimensions?.clientIP) {
        uniqueIPs.add(g.dimensions.clientIP);
      }
    }

    const uniqueVisitors = uniqueIPs.size;

    // Estimate new vs returning: visitors with multiple visits are returning
    const ipVisitCounts = {};
    for (const g of groups) {
      const ip = g.dimensions?.clientIP;
      if (ip) {
        ipVisitCounts[ip] = (ipVisitCounts[ip] || 0) + (g.sum?.visits ?? 0);
      }
    }
    let returningCount = 0;
    for (const ip in ipVisitCounts) {
      if (ipVisitCounts[ip] > 1) returningCount++;
    }
    const firstTimeCount = Math.max(0, uniqueVisitors - returningCount);

    return Response.json(
      {
        visitors_today: uniqueVisitors,
        pageviews_today: totalPageViews,
        first_time_visits: firstTimeCount,
        returning_visits: returningCount,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=120",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Metrics fetch failed:", err);

    return Response.json(
      {
        visitors_today: "—",
        pageviews_today: "—",
        first_time_visits: "—",
        returning_visits: "—",
        note: "Analytics temporarily unavailable.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
