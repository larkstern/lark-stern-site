import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "development";
export const apiVersion = "2026-01-01";

// Published content is world-readable, so no token is needed here - this
// client only ever reads, never writes (writes happen through /studio).
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
