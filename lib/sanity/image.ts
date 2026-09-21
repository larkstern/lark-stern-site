import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { projectId, dataset } from "./client";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Resolves any Sanity image reference (cover, figure, gallery item, poster) to a CDN URL builder. */
export function urlFor(source: Image) {
  return builder.image(source);
}
