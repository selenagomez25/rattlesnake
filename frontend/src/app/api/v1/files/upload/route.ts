import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/lib/storage";
import { getDb } from "@/lib/mongodb";
import { createHash } from "crypto";
import { auth } from "@/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
});

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

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        const allowedExt = ".jar";
        const maxSize = 20 * 1024 * 1024; // 20MB
        const fileName = file.name || "";
        const ext = fileName.slice(fileName.lastIndexOf("."));
        if (ext !== allowedExt) {
            return NextResponse.json({ error: "Only .jar files are allowed" }, { status: 400 });
        }
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
        }
        const allowedMimeTypes = ["", "application/java-archive", "application/x-java-archive", "application/octet-stream"];
        if (file.type && !allowedMimeTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const hash = createHash("sha256").update(buffer).digest("hex");
        const scanId = hash;
        const db = await getDb();
        const existing = await db.collection("scans").findOne({ scanId });
        if (existing) {
            return NextResponse.json({ scanId });
        }
        const s3Key = `uploads/${scanId}/${file.name}`;
        const s3Url = await uploadFileToS3({
            buffer,
            key: s3Key,
            contentType: file.type || "application/java-archive",
        });
        const scanJob = {
            scanId,
            fileName: file.name,
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