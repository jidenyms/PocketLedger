import { runController } from "@/lib/http/run-controller";
import { loginController } from "@/controllers/auth.controller";

export function POST(request: Request) {
  return runController(() => loginController(request));
}
