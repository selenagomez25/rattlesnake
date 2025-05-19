import { getDb } from "../src/lib/mongodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import WebSocket from "ws";
import { Buffer } from "buffer";
import { ReturnDocument } from "mongodb";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
const BUCKET = process.env.AWS_S3_BUCKET!;
const SCANNER_WS_URL = process.env.SCANNER_WS_URL || "ws://localhost:8081/ws";
const MAX_CONCURRENT_SCANS = 2;

let running = 0;
async function scanLoop() {
    if (running >= MAX_CONCURRENT_SCANS) return;
    running++;
    try {
        const db = await getDb();
        const update = { $set: { status: "processing", processingAt: new Date() } };
        const options = { returnDocument: ReturnDocument.AFTER };
        await db.collection("scans").findOneAndUpdate({ status: "pending" }, update, options);
        await db.collection("scans").findOneAndUpdate({ status: "processing", processingAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) } }, update, options);
        const scan = await db.collection("scans").findOne({ status: "processing" }, { sort: { processingAt: -1 } });
        if (!scan) {
            running--;
            return;
        }
        const s3Key = scan.s3Url.split(`/${BUCKET}/`)[1] || scan.s3Url.split(`.amazonaws.com/`)[1];
        const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: s3Key }));
        const stream = res.Body as Readable;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const fileBuffer = Buffer.concat(chunks);
        const scanResult: any = await new Promise((resolve, reject) => {
            const ws = new WebSocket(SCANNER_WS_URL);
            ws.on("open", () => ws.send(JSON.stringify({ hash: scan.scanId, data: fileBuffer.toString("base64") })));
            ws.on("message", data => {
                try { resolve(JSON.parse(data.toString())); } catch (err) { reject(err); }
                ws.close();
            });
            ws.on("error", reject);
            ws.on("close", () => { });
        });
        await db.collection("scans").updateOne(
            { scanId: scan.scanId },
            { $set: { status: "done", updatedAt: new Date(), result: scanResult.results || scanResult, score: scanResult.score }, $unset: { processingAt: "" } }
        );
    } catch (err: any) {
        try {
            const db = await getDb();
            if (typeof err?.scanId === "string") {
                await db.collection("scans").updateOne(
                    { scanId: err.scanId },
                    { $set: { status: "error", updatedAt: new Date(), result: { error: err instanceof Error ? err.message : String(err) } }, $unset: { processingAt: "" } }
                );
            }
        } catch { }
    }
    running--;
}

setInterval(scanLoop, 5000); 