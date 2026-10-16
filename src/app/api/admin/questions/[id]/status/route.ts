import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { questionStatusActionSchema } from "@/lib/validation/question";
import { changeQuestionStatus } from "@/services/question.service";

// Fine-grained permission per action is enforced inside changeQuestionStatus.
export const POST = adminRoute<{ id: string }>("question:read", async (req, user, { id }) => {
  const { action, note } = questionStatusActionSchema.parse(await readJson(req, 4_096));
  return jsonOk(await changeQuestionStatus(idSchema.parse(id), action, user, note));
});
