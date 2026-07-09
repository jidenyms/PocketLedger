import { NextResponse } from "next/server";
import { z } from "zod";
import { TransactionType } from "@prisma/client";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validation/category";
import * as categoryService from "@/services/category.service";

const listQuerySchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
});

export async function listCategoriesController(request: Request) {
  const ctx = await requireAuth();
  const url = new URL(request.url);
  const q = listQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
  const items = await categoryService.listCategories(ctx, {
    type: q.type,
  });
  return NextResponse.json({ items });
}

export async function createCategoryController(request: Request) {
  const ctx = await requireAuth();
  const body = createCategorySchema.parse(await request.json());
  const item = await categoryService.createCategory(ctx, body);
  return NextResponse.json({ item }, { status: 201 });
}

export async function updateCategoryController(
  request: Request,
  id: string,
) {
  const ctx = await requireAuth();
  const body = updateCategorySchema.parse(await request.json());
  const item = await categoryService.updateCategory(ctx, id, body);
  return NextResponse.json({ item });
}

export async function deleteCategoryController(
  _request: Request,
  id: string,
) {
  const ctx = await requireAuth();
  const result = await categoryService.deleteCategory(ctx, id);
  return NextResponse.json(result);
}
