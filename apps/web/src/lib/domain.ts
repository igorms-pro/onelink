export function isBaseHost(host: string): boolean {
  // Treat app base like getonelink.app, getonelink.io or localhost as base host
  const lower = host.toLowerCase();
  return (
    lower === "localhost" ||
    lower === "localhost:5173" ||
    lower === "localhost:5174" ||
    lower.endsWith("getonelink.app") ||
    lower.endsWith("getonelink.io")
  );
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
