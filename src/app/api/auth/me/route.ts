import { runController } from "@/lib/http/run-controller";
import { meController } from "@/controllers/auth.controller";

export function GET() {
  return runController(() => meController());
}
