import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

// projectId/dataset are read from env so this file needs no changes once
// real values exist (see .env.local.example) - the Vercel Sanity
// integration sets the Production/Preview equivalents itself.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "development";

export default defineConfig({
  name: "lark-stern-blog",
  title: "Lark & Stern Blog",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool()],
});
