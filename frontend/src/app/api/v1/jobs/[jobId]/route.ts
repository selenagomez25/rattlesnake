import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
});

export async function GET(
  req: NextRequest,
  context: { params: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const identifier = ip;
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    return NextResponse.json({ error: "Too many requests, slow down." }, { status: 429 });
  }

  const params = await context.params;
  const jobIdParam = params.jobId;
  const jobId = Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam;

  if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
    return NextResponse.json({ error: "Missing or invalid jobId" }, { status: 400 });
  }
  const db = await getDb();
  const scan = await db.collection("scans").findOne({ scanId: jobId });
  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  const {
    scanId,
    fileName,
    status,
    createdAt,
    updatedAt,
    result,
    userId,
    userEmail,
    size,
    malwareStatus,
    score
  } = scan;
  return NextResponse.json({
    scan: {
      scanId,
      fileName,
      status,
      createdAt,
      updatedAt,
      result,
      userId,
      userEmail,
      size,
      malwareStatus,
      score
    }
  });
} 