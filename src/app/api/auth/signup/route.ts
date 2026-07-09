import { runController } from "@/lib/http/run-controller";
import { signupController } from "@/controllers/auth.controller";

export function POST(request: Request) {
  return runController(() => signupController(request));
}
