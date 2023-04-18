export const config = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000",
};

export type Config = typeof config;
