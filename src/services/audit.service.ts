import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

/** Append-only audit trail. Metadata must never contain passwords, tokens or personal data. */
export async function audit(actorId: string | null, action: string, entityType: string, entityId: string | null, metadata?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata: metadata ? (JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue) : undefined },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err instanceof Error ? err.message : "unknown");
  }
}

export function listAuditLogs(take = 30) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, action: true, entityType: true, entityId: true, createdAt: true, metadata: true, actor: { select: { name: true } } },
  });
}
