import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      maskImage: {
        fade: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
        "fade-circle":
          "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        ".mask-fade": {
          maskImage:
            "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
        },
        ".mask-fade-circle": {
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,0) 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 70%, rgba(0,0,0,0) 90%)",
        },
      });
    },
  ],
};
export default config;
