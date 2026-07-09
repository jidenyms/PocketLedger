import { runController } from "@/lib/http/run-controller";
import { logoutController } from "@/controllers/auth.controller";

export function POST() {
  return runController(() => logoutController());
}
