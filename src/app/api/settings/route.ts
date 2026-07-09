import { runController } from "@/lib/http/run-controller";
import {
  getSettingsController,
  patchSettingsController,
} from "@/controllers/settings.controller";

export function GET() {
  return runController(() => getSettingsController());
}

export function PATCH(request: Request) {
  return runController(() => patchSettingsController(request));
}
