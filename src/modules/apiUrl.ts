const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  if (API_ORIGIN) return `${API_ORIGIN}${path}`;
  return path;
}
