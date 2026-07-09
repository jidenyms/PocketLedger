"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

const finInput =
  "!rounded-xl !border-white/10 !bg-white/5 !text-white placeholder:!text-gray-500 focus:!border-[#22c55e]/50 focus:!ring-[#22c55e]/20";

export function CreateFirstCategoryScreen({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not create category");
        return;
      }
      toast.success("Category created");
      setName("");
      onCreated();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-1 py-8 sm:py-12">
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#22c55e]">
          Step 1 of 2
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Create your first category
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Categories keep income and expenses organized. You can add more later
          — start with one that matches how you earn or spend.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Name
            </label>
            <Input
              placeholder="e.g. Sales, Rent, Software"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={finInput}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
              className={finInput}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </Select>
          </div>
          <Button type="submit" variant="neon" className="mt-2 w-full" loading={pending}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
