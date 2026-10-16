import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { userCreateSchema } from "@/lib/validation/user";
import { createUser, listUsers } from "@/services/user.service";

export const GET = adminRoute("user:manage", async () => jsonOk({ items: await listUsers() }, { headers: { "Cache-Control": "no-store" } }));

export const POST = adminRoute("user:manage", async (req, user) => {
  return jsonOk(await createUser(userCreateSchema.parse(await readJson(req, 4_096)), user), { status: 201 });
});
