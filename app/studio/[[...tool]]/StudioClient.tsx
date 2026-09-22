"use client";

// sanity.config.ts pulls in the `sanity` package's UI runtime (structureTool,
// visionTool), which uses React's createContext internally - that only
// exists in the client React build, not the RSC one. Importing it here,
// behind "use client", keeps that whole graph out of the server module tree;
// importing it directly from page.tsx (a Server Component) crashes with
// "createContext is not a function".
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export default function StudioClient() {
  return <NextStudio config={config} />;
}
