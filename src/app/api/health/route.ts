import { NextResponse } from "next/server";

/** Lightweight probe for deploy checks; does not touch the database. */
export function GET() {
  return NextResponse.json({ ok: true, service: "pocketledger" });
}
