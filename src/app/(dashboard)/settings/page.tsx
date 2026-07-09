import type { Metadata } from "next";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="pl-text-eyebrow">Control center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Account settings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
            Profile, currency, and notification preferences. Server-backed fields
            save instantly; UI-only toggles are marked in each card.
          </p>
        </div>
      </div>
      <SettingsForm />
    </div>
  );
}
