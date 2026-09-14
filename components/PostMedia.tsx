/**
 * Components the migrated MDX refers to. The Wix export emits <Figure>,
 * <Gallery> and <PostVideo> tags, and this is the map that renders them.
 *
 * Images are already resized to max 1600px by the migration, so they are served
 * directly rather than through next/image - the inline ones have no intrinsic
 * dimensions recorded, which next/image would require.
 */

type FigureProps = {
  src: string;
  alt?: string;
  caption?: string;
};

export function Figure({ src, alt = "", caption }: FigureProps) {
  return (
    <figure className="not-prose my-8">
      <img
        src={src}
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
}

/**
 * `images` arrives as a "|"-joined string, not a string[]. An array literal
 * passed as a JSX prop through this MDX pipeline reaches the component as
 * undefined (an RSC/MDX serialization gap for non-scalar prop values) - a
 * plain string, like every other prop here, does not hit it.
 */
export function Gallery({ images }: { images: string }) {
  const list = images ? images.split("|").filter(Boolean) : [];
  if (!list.length) return null;

  return (
    <div
      className={`not-prose my-8 grid gap-3 ${
        list.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"
      }`}
    >
      {list.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-56 w-full rounded-xl border border-line object-cover shadow-card"
        />
      ))}
    </div>
  );
}

export function PostVideo({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="not-prose my-8">
      <video
        controls
        preload="none"
        poster={poster}
        className="w-full rounded-2xl border border-line shadow-card"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support embedded video.{" "}
        <a href={src} className="underline">
          Download the clip
        </a>{" "}
        instead.
      </video>
    </div>
  );
}

export const postComponents = { Figure, Gallery, PostVideo };
