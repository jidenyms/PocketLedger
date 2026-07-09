import { runController } from "@/lib/http/run-controller";
import {
  getTransactionController,
  updateTransactionController,
  deleteTransactionController,
} from "@/controllers/transactions.controller";

type Ctx = { params: Promise<{ id: string }> };

export function GET(request: Request, ctx: Ctx) {
  return runController(async () => {
    const { id } = await ctx.params;
    return getTransactionController(request, id);
  });
}

export function PATCH(request: Request, ctx: Ctx) {
  return runController(async () => {
    const { id } = await ctx.params;
    return updateTransactionController(request, id);
  });
}

export function DELETE(request: Request, ctx: Ctx) {
  return runController(async () => {
    const { id } = await ctx.params;
    return deleteTransactionController(request, id);
  });
}
