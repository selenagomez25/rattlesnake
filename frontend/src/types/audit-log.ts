export interface AuditLogEntry {
  _id?: string;
  userId: string;
  userEmail: string;
  action: string; // e.g. "upload", "download", "delete"
  targetId?: string; // e.g. scanId
  timestamp: string;
  details?: Record<string, unknown>;
} 