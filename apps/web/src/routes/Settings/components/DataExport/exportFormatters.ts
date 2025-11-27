import type { ExportData } from "./exportDataFetcher";

/**
 * Formats export data as JSON
 */
export function formatAsJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Formats export data as CSV
 */
export function formatAsCSV(data: ExportData): string {
  const lines: string[] = [];

  // Profile
  if (data.profile) {
    lines.push("=== PROFILE ===");
    lines.push(Object.keys(data.profile as Record<string, unknown>).join(","));
    lines.push(
      Object.values(data.profile as Record<string, unknown>)
        .map((v) => (v === null ? "" : String(v).replace(/,/g, ";")))
        .join(","),
    );
    lines.push("");
  }

  // Links
  if (data.links && data.links.length > 0) {
    lines.push("=== LINKS ===");
    const linkKeys = Object.keys(data.links[0] as Record<string, unknown>);
    lines.push(linkKeys.join(","));
    data.links.forEach((link) => {
      lines.push(
        linkKeys
          .map((key) => {
            const value = (link as Record<string, unknown>)[key];
            return value === null ? "" : String(value).replace(/,/g, ";");
          })
          .join(","),
      );
    });
    lines.push("");
  }

  // Drops
  if (data.drops && data.drops.length > 0) {
    lines.push("=== DROPS ===");
    const dropKeys = Object.keys(data.drops[0] as Record<string, unknown>);
    lines.push(dropKeys.join(","));
    data.drops.forEach((drop) => {
      lines.push(
        dropKeys
          .map((key) => {
            const value = (drop as Record<string, unknown>)[key];
            return value === null ? "" : String(value).replace(/,/g, ";");
          })
          .join(","),
      );
    });
    lines.push("");
  }

  // Submissions
  if (data.submissions && data.submissions.length > 0) {
    lines.push("=== SUBMISSIONS ===");
    const submissionKeys = Object.keys(
      data.submissions[0] as Record<string, unknown>,
    );
    lines.push(submissionKeys.join(","));
    data.submissions.forEach((submission) => {
      lines.push(
        submissionKeys
          .map((key) => {
            const value = (submission as Record<string, unknown>)[key];
            return value === null ? "" : String(value).replace(/,/g, ";");
          })
          .join(","),
      );
    });
    lines.push("");
  }

  // Analytics
  if (data.analytics) {
    const analytics = data.analytics as {
      link_clicks?: unknown[];
      drop_views?: unknown[];
    };

    if (analytics.link_clicks && analytics.link_clicks.length > 0) {
      lines.push("=== LINK CLICKS ===");
      const clickKeys = Object.keys(
        analytics.link_clicks[0] as Record<string, unknown>,
      );
      lines.push(clickKeys.join(","));
      analytics.link_clicks.forEach((click) => {
        lines.push(
          clickKeys
            .map((key) => {
              const value = (click as Record<string, unknown>)[key];
              return value === null ? "" : String(value).replace(/,/g, ";");
            })
            .join(","),
        );
      });
      lines.push("");
    }

    if (analytics.drop_views && analytics.drop_views.length > 0) {
      lines.push("=== DROP VIEWS ===");
      const viewKeys = Object.keys(
        analytics.drop_views[0] as Record<string, unknown>,
      );
      lines.push(viewKeys.join(","));
      analytics.drop_views.forEach((view) => {
        lines.push(
          viewKeys
            .map((key) => {
              const value = (view as Record<string, unknown>)[key];
              return value === null ? "" : String(value).replace(/,/g, ";");
            })
            .join(","),
        );
      });
      lines.push("");
    }
  }

  return lines.join("\n");
}
