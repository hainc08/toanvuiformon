import { prisma } from "@/lib/db/prisma";
import { jsonOk, notFound, readJson, route } from "@/lib/http";
import { clientIp } from "@/lib/security/client-ip";
import { assertSameOrigin } from "@/lib/security/origin";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { idSchema } from "@/lib/validation/common";
import { reportSchema } from "@/lib/validation/question";
import { questionRepository } from "@/repositories/question.repository";

/** Anonymous error report ("Báo lỗi") — stores no personal data. */
export const POST = route<{ id: string }>(async (req, ctx) => {
  assertSameOrigin(req);
  enforceRateLimit(RATE_LIMITS.report, clientIp(req));
  const id = idSchema.parse((await ctx.params).id);
  const body = reportSchema.parse(await readJson(req, 4_096));
  const question = await questionRepository.findPublishedById(id);
  if (!question) throw notFound("Không tìm thấy câu hỏi.");
  await prisma.questionReport.create({ data: { questionId: id, reason: body.reason, message: body.message || null } });
  return jsonOk({ ok: true }, { status: 201 });
});
