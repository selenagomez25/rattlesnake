"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Toast, ToastProvider, ToastTitle, ToastDescription, ToastViewport } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";

const HomePage = () => {
    const [tab, setTab] = useState("upload");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [captchaOpen, setCaptchaOpen] = useState(false);
    const [captchaAction, setCaptchaAction] = useState<"upload" | "url" | "report" | null>(null);
    const [url, setUrl] = useState("");
    const [urlLoading, setUrlLoading] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [scanId, setScanId] = useState("");
    const [reportError, setReportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCaptchaAction("upload");
        setCaptchaOpen(true);
    };
    const doUpload = async (token: string) => {
        setError(null);
        setShowToast(false);
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".jar")) {
            setError("Only .jar files are allowed.");
            setShowToast(true);
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError("File too large (max 20MB)");
            setShowToast(true);
            return;
        }
        setUploading(true);
        setProgress(10);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("turnstileToken", token);
            const res = await fetch("/api/v1/files/upload", {
                method: "POST",
                body: formData,
            });
            setProgress(80);
            const data: { scanId: string; error?: string } = await res.json();
            if (!res.ok) {
                setError(data.error || "Upload failed");
                setShowToast(true);
                setUploading(false);
                return;
            }
            setProgress(100);
            setTimeout(() => {
                router.push(`/report/${data.scanId}`);
            }, 500);
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Upload failed");
            setShowToast(true);
        } finally {
            setUploading(false);
            setProgress(0);
            setCaptchaOpen(false);
        }
    };

    const handleUrlScan = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCaptchaAction("url");
        setCaptchaOpen(true);
    };
    const doUrlScan = async (token: string) => {
        setUrlError(null);
        if (!/\.jar/i.test(url)) {
            setUrlError("URL must contain .jar");
            return;
        }
        setUrlLoading(true);
        try {
            const res = await fetch("/api/v1/files/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, turnstileToken: token }),
            });
            const data: { scanId: string; error?: string } = await res.json();
            if (!res.ok) {
                setUrlError(data.error || "Failed to scan URL");
                setUrlLoading(false);
                return;
            }
            setUrlLoading(false);
            setTimeout(() => {
                router.push(`/report/${data.scanId}`);
            }, 500);
        } catch (err) {
            const error = err as Error;
            setUrlError(error.message || "Failed to scan URL");
            setUrlLoading(false);
        } finally {
            setCaptchaOpen(false);
        }
    };

    const handleViewReport = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCaptchaAction("report");
        setCaptchaOpen(true);
    };
    const doViewReport = () => {
        setReportError(null);
        if (!scanId.trim()) {
            setReportError("Please enter a Scan ID");
            return;
        }
        router.push(`/report/${scanId.trim()}`);
        setCaptchaOpen(false);
    };

    const handleCaptchaSuccess = (token: string) => {
        if (captchaAction === "upload") doUpload(token);
        else if (captchaAction === "url") doUrlScan(token);
        else if (captchaAction === "report") doViewReport();
    };

    return (
        <ToastProvider>
            <main className="flex flex-col items-center mt-20 px-4">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full max-w-3xl mx-auto mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-medium text-center mb-3">Java Malware Scanner</h1>
                    <p className="text-muted-foreground text-center max-w-xl mx-auto">Quickly scan JAR files for potential security threats and vulnerabilities.</p>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                    className="w-full max-w-xl mx-auto"
                >
                    <Tabs value={tab} onValueChange={setTab} className="w-full flex flex-col items-center gap-6">
                        {/* Tab Navigation */}
                        <TabsList className="mb-6 inline-flex justify-center items-center gap-2 bg-card/30 p-1.5 rounded-full border border-border/20 mx-auto shadow-md backdrop-blur-sm">
                            <TabsTrigger
                                value="upload"
                                className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm px-5 py-2 rounded-full transition-all duration-200 min-w-[110px] flex-shrink-0 text-center hover:bg-card/80"
                            >
                                Upload File
                            </TabsTrigger>
                            <TabsTrigger
                                value="url"
                                className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm px-5 py-2 rounded-full transition-all duration-200 min-w-[110px] flex-shrink-0 text-center hover:bg-card/80"
                            >
                                Scan by URL
                            </TabsTrigger>
                            <TabsTrigger
                                value="report"
                                className="data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm px-5 py-2 rounded-full transition-all duration-200 min-w-[110px] flex-shrink-0 text-center hover:bg-card/80"
                            >
                                View Report
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Content Container */}
                        <div className="w-full rounded-2xl border border-border/20 bg-background/20 backdrop-blur-sm shadow-lg overflow-hidden">
                            <AnimatePresence mode="wait">
                                {/* Upload File Tab */}
                                {tab === "upload" && (
                                    <TabsContent value="upload" forceMount>
                                        <motion.div
                                            key="upload"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-6"
                                        >
                                            <h2 className="text-xl md:text-2xl font-medium text-foreground text-center mb-2">Upload File</h2>
                                            <p className="text-sm text-muted-foreground text-center mb-6">Select a .jar file to scan for malware. Max 20MB.</p>
                                            <form className="w-full flex flex-col items-center gap-4" onSubmit={handleUploadSubmit}>
                                                <Input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".jar"
                                                    className="w-full text-foreground"
                                                    disabled={uploading}
                                                    required
                                                />
                                                <Button
                                                    type="submit"
                                                    variant="default"
                                                    className="w-full"
                                                    disabled={uploading}
                                                >
                                                    {uploading ? "Uploading..." : "Upload & Scan"}
                                                </Button>
                                                {uploading && <Progress value={progress} className="mt-2 w-full" />}
                                                {error && showToast && (
                                                    <Toast open={showToast} onOpenChange={setShowToast} variant="destructive">
                                                        <ToastTitle>Error</ToastTitle>
                                                        <ToastDescription>{error}</ToastDescription>
                                                    </Toast>
                                                )}
                                            </form>
                                        </motion.div>
                                    </TabsContent>
                                )}

                                {/* Scan by URL Tab */}
                                {tab === "url" && (
                                    <TabsContent value="url" forceMount>
                                        <motion.div
                                            key="url"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-6"
                                        >
                                            <h2 className="text-xl md:text-2xl font-medium text-foreground text-center mb-2">Scan by URL</h2>
                                            <p className="text-sm text-muted-foreground text-center mb-6">Paste a direct link to a .jar file. We&apos;ll fetch and scan it for you.</p>
                                            <form onSubmit={handleUrlScan} className="w-full flex flex-col items-center gap-4">
                                                <Input
                                                    type="url"
                                                    placeholder="Paste .jar file URL (must contain .jar)"
                                                    value={url}
                                                    onChange={e => setUrl(e.target.value)}
                                                    className="w-full text-foreground"
                                                    required
                                                />
                                                <Button type="submit" variant="default" className="w-full" disabled={urlLoading}>
                                                    {urlLoading ? "Scanning..." : "Scan URL"}
                                                </Button>
                                                {urlError && <div className="text-red-500 text-sm text-center w-full">{urlError}</div>}
                                            </form>
                                        </motion.div>
                                    </TabsContent>
                                )}

                                {/* View Report Tab */}
                                {tab === "report" && (
                                    <TabsContent value="report" forceMount>
                                        <motion.div
                                            key="report"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-6"
                                        >
                                            <h2 className="text-xl md:text-2xl font-medium text-foreground text-center mb-2">View Report</h2>
                                            <p className="text-sm text-muted-foreground text-center mb-6">Enter your Scan ID to view the results of a previous scan.</p>
                                            <form onSubmit={handleViewReport} className="w-full flex flex-col items-center gap-4">
                                                <Input
                                                    type="text"
                                                    placeholder="Enter Scan ID"
                                                    value={scanId}
                                                    onChange={e => setScanId(e.target.value)}
                                                    className="w-full text-foreground"
                                                    required
                                                />
                                                <Button type="submit" variant="default" className="w-full">
                                                    View Report
                                                </Button>
                                                {reportError && <div className="text-red-500 text-sm text-center w-full">{reportError}</div>}
                                            </form>
                                        </motion.div>
                                    </TabsContent>
                                )}
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </motion.div>

                {/* Captcha Modal */}
                {captchaOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                        onClick={e => {
                            if (e.target === e.currentTarget) setCaptchaOpen(false);
                        }}
                    >
                        <div
                            className="relative bg-card/80 backdrop-blur-xl p-5 rounded-2xl border border-border/20 shadow-lg"
                        >
                            <button
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-background/50 hover:bg-secondary/50 transition-all duration-200 text-foreground z-10 shadow-sm"
                                onClick={() => setCaptchaOpen(false)}
                                aria-label="Close captcha"
                                type="button"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <Turnstile
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                                onSuccess={handleCaptchaSuccess}
                                onExpire={() => {}}
                                options={{ theme: 'dark' }}
                            />
                        </div>
                    </div>
                )}
                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
                    className="w-full max-w-3xl mx-auto mt-16 mb-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-medium mb-1">Secure Scanning</h3>
                            <p className="text-sm text-muted-foreground">Advanced detection of malicious code and vulnerabilities</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-medium mb-1">Fast Results</h3>
                            <p className="text-sm text-muted-foreground">Quick analysis with detailed reporting</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-medium mb-1">Privacy Focused</h3>
                            <p className="text-sm text-muted-foreground">Your files are analyzed securely and privately</p>
                        </div>
                    </div>
                </motion.div>

                <ToastViewport />
            </main>
        </ToastProvider>
    );
};

export default HomePage;