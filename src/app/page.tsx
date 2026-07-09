import { LandingPage } from "@/components/marketing/landing-page";

/** Avoid stale HTML/edge caches showing an older marketing shell after deploy. */
export const dynamic = "force-dynamic";

export default function Home() {
  return <LandingPage />;
}
