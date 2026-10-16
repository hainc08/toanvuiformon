import { jsonOk, readJson, searchParamsObject } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { adminQuestionListSchema, questionCreateSchema } from "@/lib/validation/question";
import { createQuestion, listAdminQuestions } from "@/services/question.service";

export const GET = adminRoute("question:read", async (req) => {
  const { page, pageSize, ...filter } = adminQuestionListSchema.parse(searchParamsObject(req));
  return jsonOk(await listAdminQuestions(filter, page, pageSize), { headers: { "Cache-Control": "no-store" } });
});

export const POST = adminRoute("question:write", async (req, user) => {
  const input = questionCreateSchema.parse(await readJson(req));
  const q = await createQuestion(input, user);
  return jsonOk({ id: q.id, code: q.code }, { status: 201 });
});
