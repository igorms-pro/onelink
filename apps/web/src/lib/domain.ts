export function isBaseHost(host: string): boolean {
  // Treat app base like getonelink.app or localhost as base host
  const lower = host.toLowerCase();
  return (
    lower === "localhost:5173" ||
    lower === "localhost" ||
    lower.endsWith("getonelink.app")
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
