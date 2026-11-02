import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#17202a", brand: "#146b57", sand: "#f6f4ef", gold: "#f5a623" }, boxShadow: { soft: "0 10px 30px rgba(20,30,40,.08)" } } },
  plugins: []
};
export default config;