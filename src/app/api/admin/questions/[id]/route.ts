import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { questionUpdateSchema } from "@/lib/validation/question";
import { deleteQuestion, getAdminQuestion, updateQuestion } from "@/services/question.service";

export const GET = adminRoute<{ id: string }>("question:read", async (_req, _user, { id }) => {
  return jsonOk(await getAdminQuestion(idSchema.parse(id)), { headers: { "Cache-Control": "no-store" } });
});

export const PATCH = adminRoute<{ id: string }>("question:write", async (req, user, { id }) => {
  const input = questionUpdateSchema.parse(await readJson(req));
  const res = await updateQuestion(idSchema.parse(id), input, user);
  return jsonOk({ id: res.question.id, version: res.question.currentVersion, status: res.question.status, sentBackToReview: res.sentBackToReview });
});

export const DELETE = adminRoute<{ id: string }>("question:delete", async (_req, user, { id }) => {
  await deleteQuestion(idSchema.parse(id), user);
  return jsonOk({ ok: true });
});
