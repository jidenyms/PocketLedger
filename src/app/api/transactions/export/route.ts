import { runController } from "@/lib/http/run-controller";
import { exportTransactionsCsvController } from "@/controllers/transactions-export.controller";

export function GET() {
  return runController(() => exportTransactionsCsvController());
}
