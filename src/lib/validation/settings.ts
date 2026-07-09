import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/format/currency";

const codes = SUPPORTED_CURRENCIES as unknown as [string, ...string[]];

export const updateSettingsSchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    preferredCurrency: z.enum(codes).optional(),
  })
  .strict()
  .refine(
    (d) => d.name !== undefined || d.preferredCurrency !== undefined,
    { message: "Provide at least one field: name or preferredCurrency" },
  );

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
