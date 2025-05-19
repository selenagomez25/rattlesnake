'use client';

import type { ScanJob } from "@/types/scan";
import { ArrowLeftIcon, BadgeCheck, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Wrapper from "@/components/global/wrapper";
import Container from "@/components/global/container";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [scans, setScans] = useState<ScanJob[]>([]);

    useEffect(() => {
        async function fetchScans() {
            try {
                const response = await fetch("/api/v1/files");
                const data = await response.json();
                console.log("Fetched scans:", data);
                if (response.ok) {
                    setScans(data.scans);
                } else {
                    console.error("Failed to fetch scans:", data.error);
                }
            } catch (error) {
                console.error("Error fetching scans:", error);
            }
        }
        if (status === "authenticated" && session) {
            fetchScans();
        }
    }, [session, status]);

    if (status === "unauthenticated") {
        return (
            <main className="relative flex flex-col items-center justify-center px-4 h-dvh bg-background text-foreground">
                <Wrapper>
                    <Container className="flex flex-col items-center justify-center mx-auto py-16">
                        <motion.div
                            className="flex items-center justify-center h-full flex-col"
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={fadeIn}
                        >
                            <span className="text-sm px-3.5 py-1 rounded-md bg-gradient-to-br from-sky-400 to-blue-600 text-neutral-50 custom-shadow font-base">
                                401
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold mt-5 font-heading">
                                Not Signed In
                            </h1>
                            <p className="text-base text-muted-foreground mt-5 text-center mx-auto max-w-xl font-base">
                                You must be signed in to view your dashboard.
                            </p>
                            <Link href="/">
                                <Button variant="outline" className="mt-8 font-base">
                                    <ArrowLeftIcon className="size-4" />
                                    Back
                                </Button>
                            </Link>
                        </motion.div>
                    </Container>
                </Wrapper>
            </main>
        );
    }

    const totalScans = scans.length;
    const lastScan = scans[0]?.createdAt ? new Date(scans[0].createdAt).toLocaleString() : "-";
    const visibleScans = scans.slice(0, 4);

    return (
        <motion.main
            className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
        >
            <motion.section
                className="w-full max-w-2xl mx-auto flex flex-col items-center mb-10"
                initial="initial"
                animate="animate"
                variants={fadeIn}
            >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-base text-muted-foreground mb-6 text-center">Welcome back! Here&apos;s a summary of your recent scans.</p>
                <motion.div
                    className="flex gap-6 mb-8"
                    initial="initial"
                    animate="animate"
                    variants={fadeIn}
                >
                    <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <span className="text-lg font-semibold text-white">{totalScans}</span>
                        <span className="text-xs text-muted-foreground">Total Scans</span>
                    </motion.div>
                    <motion.div
                        className="flex flex-col items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <span className="text-lg font-semibold text-white">{lastScan}</span>
                        <span className="text-xs text-muted-foreground">Last Scan</span>
                    </motion.div>
                </motion.div>
            </motion.section>
            <motion.section
                className="w-full max-w-3xl mx-auto"
                initial="initial"
                animate="animate"
                variants={fadeIn}
            >
                <h2 className="text-xl font-semibold text-white mb-4">Scan History</h2>
                {scans.length === 0 ? (
                    <motion.div
                        className="text-white/80 text-center"
                        initial="initial"
                        animate="animate"
                        variants={fadeIn}
                    >
                        No scans yet.
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        {visibleScans.map((scan) => (
                            <motion.div
                                key={scan.scanId}
                                className="bg-background/80 rounded-2xl shadow-xl p-6 flex flex-col gap-2"
                                initial="initial"
                                animate="animate"
                                variants={fadeIn}
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    <span className="font-semibold text-white truncate" title={scan.fileName}>{scan.fileName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BadgeCheck className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-green-400 font-medium capitalize">{scan.status}</span>
                                </div>
                                <div className="text-xs text-white/60 mb-2">Uploaded: {new Date(scan.createdAt).toLocaleString()}</div>
                                <Link href={`/report/${scan.scanId}`} className="w-full">
                                    <Button size="sm" className="w-full mt-2">View Report</Button>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.section>
        </motion.main>
    );
} 