import { getDb } from "./mongodb";
import type { AuditLogEntry } from "@/types/audit-log";

export async function logAudit(entry: AuditLogEntry) {
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = entry;
  await db.collection("audit_logs").insertOne(rest);
} 