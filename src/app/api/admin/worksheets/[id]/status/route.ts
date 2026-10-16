import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { worksheetStatusSchema } from "@/lib/validation/worksheet";
import { setWorksheetStatus } from "@/services/worksheet-admin.service";

export const POST = adminRoute<{ id: string }>("worksheet:publish", async (req, user, { id }) => {
  const { status } = worksheetStatusSchema.parse(await readJson(req, 1_024));
  return jsonOk(await setWorksheetStatus(idSchema.parse(id), status, user));
});
