import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/storage";
import { getDb } from "@/lib/mongodb";
import { createHash } from "crypto";
import { auth } from "@/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id || null;
        const userEmail = session?.user?.email || null;

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const identifier = userId || ip;
        const { success } = await ratelimit.limit(identifier);
        if (!success) {
            return NextResponse.json({ error: "Too many uploads, slow down." }, { status: 429 });
        }

        const { url } = await req.json();
        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }
        const urlObj = new URL(url);
        if (!urlObj.pathname.endsWith(".jar")) {
            return NextResponse.json({ error: "Only .jar files are allowed" }, { status: 400 });
        }

        const fetchRes = await fetch(url);
        if (!fetchRes.ok) {
            return NextResponse.json({ error: "Failed to download file from URL" }, { status: 400 });
        }
        const contentLength = fetchRes.headers.get("content-length");
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (contentLength && parseInt(contentLength) > maxSize) {
            return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
        }
        const buffer = Buffer.from(await fetchRes.arrayBuffer());
        if (buffer.length > maxSize) {
            return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
        }
        const fileName = urlObj.pathname.split("/").pop() || "file.jar";
        const ext = fileName.slice(fileName.lastIndexOf("."));
        if (ext !== ".jar") {
            return NextResponse.json({ error: "Only .jar files are allowed" }, { status: 400 });
        }

        const hash = createHash("sha256").update(buffer).digest("hex");
        const scanId = hash;
        const db = await getDb();
        const existing = await db.collection("scans").findOne({ scanId });
        if (existing) {
            return NextResponse.json({ scanId });
        }
        const s3Key = `uploads/${scanId}/${fileName}`;
        const s3Url = await uploadFileToS3({
            buffer,
            key: s3Key,
            contentType: "application/java-archive",
        });
        const scanJob = {
            scanId,
            fileName,
            s3Url,
            status: "pending", // or 'queued', 'processing', 'done', 'error'
            createdAt: new Date(),
            updatedAt: new Date(),
            result: null,
            userId,
            userEmail,
        };
        await db.collection("scans").insertOne(scanJob);
        return NextResponse.json({ scanId });
    } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    }
} 