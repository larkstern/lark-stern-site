export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

import StudioClient from "./StudioClient";

// Auth is Sanity's own (Google/email login, membership managed in the
// Sanity project dashboard) - this route has no logic of its own beyond
// mounting the Studio, so there is nothing here for app code to gate.
export default function StudioPage() {
  return <StudioClient />;
}
