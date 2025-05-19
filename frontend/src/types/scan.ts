export interface ScanJob {
  scanId: string;
  fileName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  result: unknown;
  userId: string | null;
  userEmail: string | null;
  size?: number;
  malwareStatus?: string;
  score?: number;
} 