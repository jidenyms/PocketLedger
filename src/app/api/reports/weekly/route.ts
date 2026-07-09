import { runController } from "@/lib/http/run-controller";
import { weeklyReportController } from "@/controllers/reports-weekly.controller";

export function GET() {
  return runController(() => weeklyReportController());
}
