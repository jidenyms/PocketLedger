import { runController } from "@/lib/http/run-controller";
import { financialReportController } from "@/controllers/reports.controller";

export function GET(request: Request) {
  return runController(() => financialReportController(request));
}
