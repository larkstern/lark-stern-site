import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lark & Stern — light theme surfaces
        canvas: "#FBFCFE", // page background (soft white)
        paper: "#F2F5FA", // alternating section background
        card: "#FFFFFF", // card background
        line: "rgba(30, 55, 104, 0.12)", // hairlines (navy @ 12%)

        // Brand palette
        navy: "#1E3768", // brand primary / headings ("ink")
        steel: "#56698E", // brand secondary / muted text
        mist: "#8E9BB4", // brand tertiary / faint text
        pale: "#C7CDDA", // brand light / dividers on tint
        ink: "#27314A", // body copy (slate derived from navy)
        gold: {
          DEFAULT: "#B8901F", // brand accent — readable on white, used sparingly
          soft: "#D4AF37",
        },
        // Cheetah accent — tawny/amber motif, the running-cheetah identity
        cheetah: {
          DEFAULT: "#C8772E",
          deep: "#9C5A1E",
          spot: "#3A2A17",
          sand: "#E7C9A0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,55,104,0.04), 0 12px 32px -16px rgba(30,55,104,0.18)",
        cardHover:
          "0 2px 4px rgba(30,55,104,0.06), 0 24px 48px -20px rgba(30,55,104,0.28)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        drift: "drift 18s ease-in-out infinite alternate",
        sprint: "sprint 7s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%": { transform: "translate3d(-2%, -1%, 0) scale(1)" },
          "100%": { transform: "translate3d(2%, 1%, 0) scale(1.06)" },
        },
        sprint: {
          "0%": { transform: "translateX(-30vw)" },
          "100%": { transform: "translateX(130vw)" },
        },
      },
      typography: {
        lark: {
          css: {
            "--tw-prose-body": "#27314A", // ink
            "--tw-prose-headings": "#1E3768", // navy
            "--tw-prose-lead": "#56698E", // steel
            "--tw-prose-links": "#9C5A1E", // cheetah-deep, readable on white
            "--tw-prose-bold": "#1E3768",
            "--tw-prose-counters": "#8E9BB4", // mist
            "--tw-prose-bullets": "#C7CDDA", // pale
            "--tw-prose-hr": "rgba(30, 55, 104, 0.12)", // line
            "--tw-prose-quotes": "#1E3768",
            "--tw-prose-quote-borders": "#C8772E", // cheetah
            "--tw-prose-captions": "#8E9BB4",
            "--tw-prose-th-borders": "rgba(30, 55, 104, 0.12)",
            "--tw-prose-td-borders": "rgba(30, 55, 104, 0.12)",
            maxWidth: "none",
            // A heading always starts below any earlier floated image (e.g. a
            // team member's photo), never beside its leftover tail - keeps
            // each person's name/photo/facts grouped and never overlapping.
            "h2, h3, h4": { clear: "both" },
            // The tag-links line is always the last paragraph in a post -
            // clear it too, so it never wraps beside a trailing floated image.
            "p:last-child": { clear: "both" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
