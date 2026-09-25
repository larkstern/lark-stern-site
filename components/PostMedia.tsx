/**
 * Portable Text renderers for the post body's custom block types (figure,
 * gallery, postVideo - defined in sanity/schemaTypes/post.ts). These are the
 * Sanity-era replacements for the migrated MDX <Figure>/<Gallery>/<PostVideo>
 * tags this file used to export directly.
 */
import type { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";

export const postComponents: PortableTextComponents = {
  types: {
    figure: ({ value }) => {
      const { asset, alt = "", caption, wrap } = value ?? {};
      if (!asset) return null;
      return (
        <figure
          className={
            wrap
              ? "not-prose float-left clear-left mb-4 mr-6 w-1/2 min-w-[220px] max-w-[340px]"
              : "not-prose clear-both my-8"
          }
        >
          <img
            src={urlFor(asset).width(1600).url()}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-2xl border border-line shadow-card"
          />
          {caption ? (
            <figcaption className="mt-3 text-center font-mono text-xs text-mist">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },

    gallery: ({ value }) => {
      const images: any[] = value?.images ?? [];
      if (!images.length) return null;
      return (
        <div
          className={`not-prose my-8 grid gap-3 ${
            images.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
          }`}
        >
          {images.map((image, i) => (
            <img
              key={i}
              src={urlFor(image).width(800).url()}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-56 w-full rounded-xl border border-line object-cover shadow-card"
            />
          ))}
        </div>
      );
    },

    postVideo: ({ value }) => {
      const { url, poster } = value ?? {};
      if (!url) return null;
      return (
        <div className="not-prose my-8">
          <video
            controls
            preload="none"
            poster={poster ? urlFor(poster).width(1600).url() : undefined}
            className="w-full rounded-2xl border border-line shadow-card"
          >
            <source src={url} type="video/mp4" />
            Your browser does not support embedded video.{" "}
            <a href={url} className="underline">
              Download the clip
            </a>{" "}
            instead.
          </video>
        </div>
      );
    },

    // @sanity/table stores { rows: [{ _key, cells: string[] }] }. The first row
    // is treated as the header, matching how the migrated Wix tables read.
    table: ({ value }) => {
      const rows: { _key?: string; cells?: string[] }[] = value?.rows ?? [];
      if (!rows.length) return null;
      const [head, ...body] = rows;
      return (
        // not-prose + overflow-x-auto so a wide table scrolls on mobile
        // instead of forcing the whole page to scroll sideways.
        <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-line shadow-card">
          <table className="w-full border-collapse text-sm">
            {head ? (
              <thead>
                <tr>
                  {(head.cells ?? []).map((cell, i) => (
                    <th
                      key={i}
                      className="border-b border-line bg-paper px-4 py-2.5 text-left font-semibold text-navy"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {body.map((row, r) => (
                <tr key={row._key ?? r} className="even:bg-paper/40">
                  {(row.cells ?? []).map((cell, c) => (
                    <td
                      key={c}
                      className="border-b border-line px-4 py-2.5 align-top text-ink"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
};
