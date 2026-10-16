/**
 * Idempotent seed: curriculum (grade 6, chapters, topics), question bank and sample worksheets.
 *
 * Safe to run multiple times and on production: existing rows (matched by slug / code)
 * are NOT overwritten, so edits made in the Admin are preserved.
 *
 * Usage: npm run db:seed
 * Optional: SEED_PUBLISH_VERIFIED=false to keep all questions in review.
 * Optional: SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD to create the first admin account.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createAdapter } from "../src/lib/db/adapter";
import { PrismaClient } from "../src/generated/prisma/client";
import { buildSnapshot } from "../src/features/questions/snapshot";
import { CHAPTERS, CURRICULUM, GRADE_6 } from "./data/curriculum";
import { ALL_SEED_QUESTIONS } from "./data/questions";
import { SEED_WORKSHEETS } from "./data/worksheets";
import { assignCodes } from "./data/codes";

const prisma = new PrismaClient({ adapter: createAdapter(process.env.DATABASE_URL) });

const SOURCE_VERIFIED = "Toán Vui biên soạn — đáp án đã kiểm tra tự động";
const SOURCE_PENDING = "Toán Vui biên soạn — chờ giáo viên duyệt";
const DIFFICULTY_RANK = { BASIC: 0, APPLIED: 1, ADVANCED: 2 } as const;

async function seedCurriculum() {
  const curriculum = await prisma.curriculum.upsert({
    where: { code: CURRICULUM.code },
    update: {},
    create: CURRICULUM,
  });
  const grade = await prisma.grade.upsert({
    where: { slug: GRADE_6.slug },
    update: {},
    create: { ...GRADE_6, sortOrder: 6, status: "PUBLISHED" },
  });

  const topicIds = new Map<string, { topicId: string; chapterId: string }>();
  for (const ch of CHAPTERS) {
    const chapter = await prisma.chapter.upsert({
      where: { gradeId_slug: { gradeId: grade.id, slug: ch.slug } },
      update: {},
      create: {
        gradeId: grade.id,
        curriculumId: curriculum.id,
        number: ch.number,
        title: ch.title,
        slug: ch.slug,
        summary: ch.summary,
        keyPoints: ch.keyPoints,
        sortOrder: ch.number,
        status: "PUBLISHED",
      },
    });
    for (const [index, tp] of ch.topics.entries()) {
      const topic = await prisma.topic.upsert({
        where: { chapterId_slug: { chapterId: chapter.id, slug: tp.slug } },
        update: {},
        create: {
          chapterId: chapter.id,
          title: tp.title,
          slug: tp.slug,
          summary: tp.summary,
          knowledgeSummary: tp.knowledgeSummary ?? null,
          example: tp.example ?? null,
          sortOrder: index + 1,
          status: "PUBLISHED",
        },
      });
      topicIds.set(`${ch.slug}/${tp.slug}`, { topicId: topic.id, chapterId: chapter.id });
    }
  }
  return { grade, topicIds };
}

async function seedQuestions(gradeId: string, topicIds: Map<string, { topicId: string; chapterId: string }>) {
  let created = 0;
  let published = 0;
  for (const { code, q } of assignCodes(ALL_SEED_QUESTIONS)) {
    const ids = topicIds.get(q.topic);
    if (!ids) throw new Error(`Unknown topic "${q.topic}" for ${code}`);

    const verified = q.verify ? q.verify() : false;
    if (q.verify && !verified) throw new Error(`Verification FAILED for ${code}: ${q.content.slice(0, 80)}`);

    const exists = await prisma.question.findUnique({ where: { code }, select: { id: true } });
    if (exists) continue;

    // SEED_PUBLISH_VERIFIED=false → every seeded question waits for human review.
    const autoPublish = verified && process.env.SEED_PUBLISH_VERIFIED !== "false";
    const status = autoPublish ? "PUBLISHED" : "PENDING_REVIEW";
    const options = (q.options ?? []).map((o, i) => ({ label: o.label, content: o.content, isCorrect: Boolean(o.correct), sortOrder: i }));
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          code,
          gradeId,
          chapterId: ids.chapterId,
          topicId: ids.topicId,
          difficulty: q.difficulty,
          type: q.type,
          content: q.content,
          answer: q.answer,
          solution: q.solution,
          tags: q.tags ?? [],
          status,
          source: verified ? SOURCE_VERIFIED : SOURCE_PENDING,
          currentVersion: 1,
          reviewedAt: autoPublish ? now : null,
          publishedAt: autoPublish ? now : null,
          options: { create: options },
        },
      });
      await tx.questionRevision.create({
        data: {
          questionId: question.id,
          version: 1,
          changeNote: "Khởi tạo từ seed",
          snapshot: JSON.parse(JSON.stringify(buildSnapshot({ code, type: q.type, difficulty: q.difficulty, content: q.content, answer: q.answer, solution: q.solution, options }))),
        },
      });
    });
    created += 1;
    if (autoPublish) published += 1;
  }
  return { created, published };
}

async function seedWorksheets(gradeId: string) {
  let created = 0;
  for (const ws of SEED_WORKSHEETS) {
    const exists = await prisma.worksheet.findUnique({ where: { slug: ws.slug }, select: { id: true } });
    if (exists) continue;

    const chapter = await prisma.chapter.findUniqueOrThrow({ where: { gradeId_slug: { gradeId, slug: ws.chapter } } });
    const topics = await prisma.topic.findMany({ where: { chapterId: chapter.id, slug: { in: ws.topics } } });
    const topicOrder = new Map(ws.topics.map((slug, i) => [slug, i]));
    const topicById = new Map(topics.map((t) => [t.id, t]));

    const questions = await prisma.question.findMany({
      where: { topicId: { in: topics.map((t) => t.id) }, status: "PUBLISHED" },
      include: { revisions: { orderBy: { version: "desc" }, take: 1 } },
    });
    questions.sort(
      (a, b) =>
        DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
        (topicOrder.get(topicById.get(a.topicId)?.slug ?? "") ?? 0) - (topicOrder.get(topicById.get(b.topicId)?.slug ?? "") ?? 0) ||
        a.code.localeCompare(b.code),
    );
    const picked = questions.slice(0, ws.maxQuestions);
    if (picked.length < 5) {
      console.warn(`  ! Skip worksheet "${ws.slug}": only ${picked.length} published questions`);
      continue;
    }

    await prisma.worksheet.create({
      data: {
        slug: ws.slug,
        title: ws.title,
        description: ws.description,
        kind: "CURATED",
        status: "PUBLISHED",
        gradeId,
        chapterId: chapter.id,
        topicId: ws.topics.length === 1 ? topics[0]?.id : null,
        durationMinutes: ws.durationMinutes,
        questionCount: picked.length,
        isFeatured: ws.isFeatured ?? false,
        publishedAt: new Date(),
        questions: {
          create: picked.map((q, i) => {
            const revision = q.revisions[0];
            if (!revision) throw new Error(`Question ${q.code} has no revision`);
            return { questionId: q.id, questionRevisionId: revision.id, position: i + 1 };
          }),
        },
      },
    });
    created += 1;
  }
  return created;
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return null;
  if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return null;
  await prisma.user.create({
    data: { email, name: process.env.SEED_ADMIN_NAME ?? "Quản trị viên", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  return email;
}

async function main() {
  console.log("Seeding Toán Vui…");
  const { grade, topicIds } = await seedCurriculum();
  console.log(`  ✓ Curriculum: ${CHAPTERS.length} chapters, ${topicIds.size} topics`);
  const q = await seedQuestions(grade.id, topicIds);
  console.log(`  ✓ Questions: ${q.created} created (${q.published} published, ${q.created - q.published} pending review)`);
  const w = await seedWorksheets(grade.id);
  console.log(`  ✓ Worksheets: ${w} created`);
  const admin = await seedAdmin();
  if (admin) console.log(`  ✓ Admin account created: ${admin}`);
}

const isDirectRun = process.argv[1]?.replace(/\\/g, "/").endsWith("prisma/seed.ts");
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
