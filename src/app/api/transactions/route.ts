import { runController } from "@/lib/http/run-controller";
import {
  listTransactionsController,
  createTransactionController,
} from "@/controllers/transactions.controller";

export function GET(request: Request) {
  return runController(() => listTransactionsController(request));
}

export function POST(request: Request) {
  return runController(() => createTransactionController(request));
}
