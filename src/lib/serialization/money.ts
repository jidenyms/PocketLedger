/** Prisma `Decimal` — avoid importing runtime types where possible. */
type Decimalish = { toString(): string };

export function decimalToString(value: Decimalish | null | undefined): string | null {
  if (value == null) return null;
  return value.toString();
}
