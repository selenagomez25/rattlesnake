import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        const scanDocs = await db
            .collection("scans")
            .find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .toArray();

        const scans = scanDocs.map((doc) => ({
            scanId: doc.scanId,
            fileName: doc.fileName,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            result: doc.result,
            userId: doc.userId,
            userEmail: doc.userEmail,
            size: doc.size,
            malwareStatus: doc.malwareStatus,
            score: doc.score,
        }));

        return NextResponse.json({ scans });
    } catch (error) {
        console.error("Error fetching scans:", error);
        return NextResponse.json(
            { error: "Failed to fetch scans" },
            { status: 500 }
        );
    }
} 