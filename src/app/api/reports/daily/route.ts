import { runController } from "@/lib/http/run-controller";
import { dailyReportController } from "@/controllers/reports-daily.controller";

export function GET() {
  return runController(() => dailyReportController());
}
