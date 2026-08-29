export const getAdminSecretPath = (): string => {
  // Server-side only: Reads ADMIN_PANEL_PATH environment variable (no NEXT_PUBLIC_ prefix)
  const path = process.env.ADMIN_PANEL_PATH || "khan-sec-manage-x7k9";
  return path.replace(/^\//, "");
};

export const isAdminRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  const cleanPath = pathname.replace(/^\//, "");
  return cleanPath.startsWith("admin") || cleanPath.includes("sec-manage") || cleanPath.includes("khan-sec");
};
