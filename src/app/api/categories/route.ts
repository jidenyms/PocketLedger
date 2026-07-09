import { runController } from "@/lib/http/run-controller";
import {
  listCategoriesController,
  createCategoryController,
} from "@/controllers/categories.controller";

export function GET(request: Request) {
  return runController(() => listCategoriesController(request));
}

export function POST(request: Request) {
  return runController(() => createCategoryController(request));
}
