import { runController } from "@/lib/http/run-controller";
import {
  updateCategoryController,
  deleteCategoryController,
} from "@/controllers/categories.controller";

type Ctx = { params: Promise<{ id: string }> };

export function PATCH(request: Request, ctx: Ctx) {
  return runController(async () => {
    const { id } = await ctx.params;
    return updateCategoryController(request, id);
  });
}

export function DELETE(request: Request, ctx: Ctx) {
  return runController(async () => {
    const { id } = await ctx.params;
    return deleteCategoryController(request, id);
  });
}
