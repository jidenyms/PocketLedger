import { runController } from "@/lib/http/run-controller";
import { monthlyReportController } from "@/controllers/reports.controller";

export function GET(request: Request) {
  return runController(() => monthlyReportController(request));
}
