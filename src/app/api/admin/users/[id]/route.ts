import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { userUpdateSchema } from "@/lib/validation/user";
import { updateUser } from "@/services/user.service";

export const PATCH = adminRoute<{ id: string }>("user:manage", async (req, user, { id }) => {
  return jsonOk(await updateUser(idSchema.parse(id), userUpdateSchema.parse(await readJson(req, 4_096)), user));
});
