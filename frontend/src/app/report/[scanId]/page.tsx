"use client";

import * as React from "react";
import type { ScanJob } from "@/types/scan";
import { useParams } from "next/navigation";
import Loader from "@/app/loading";
import { useEffect, useState } from "react";
import { FileText, Copy, Code, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedReport } from "@/components/report/FormattedReport";

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ReportPage() {
    const params = useParams();
    const scanId = typeof params.scanId === "string" ? params.scanId : "";
    const [scan, setScan] = useState<ScanJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function fetchScan() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/v1/jobs/${scanId}`);
                if (!res.ok) throw new Error("Scan not found");
                const data = await res.json();
                if (active) setScan(data.scan);
            } catch (err: unknown) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unknown error");
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        fetchScan();
        return () => { active = false; };
    }, [scanId]);

    let rawResultString = '';
    if (scan && scan.result) {
        if (typeof scan.result === 'object') {
            try {
                rawResultString = JSON.stringify(scan.result, null, 2);
            } catch {
                rawResultString = String(scan.result);
            }
        } else {
            rawResultString = String(scan.result);
        }
    }

    return (
        <main className="flex flex-col items-center min-h-[80vh] w-full px-4 justify-center">
            <section className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center mt-16 mb-20 gap-4">
                {loading && !scan && (
                    <div className="flex flex-col items-center justify-center w-full h-80 bg-card/20 rounded-2xl border border-border/20 p-8">
                        <Loader />
                        <span className="mt-6 text-primary text-lg font-medium">Loading scan report...</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center text-base font-medium px-6 py-8 w-full flex flex-col items-center gap-3">
                        <AlertCircle className="w-10 h-10" />
                        <p>{error}</p>
                    </div>
                )}
                {scan && (
                    <TooltipProvider>
                        <div className="flex flex-col items-center gap-2 w-full">
                            {typeof scan.score === 'number' && (
                                <div className="w-full mb-6 flex flex-col items-center">
                                    <span className="text-sm text-muted-foreground mb-2">Risk Score</span>
                                    <div
                                        className={`flex items-center justify-center w-24 h-24 rounded-full font-bold text-2xl shadow-lg border-4
                                            ${scan.score >= 80 ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                                scan.score >= 50 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                                                    'bg-green-500/20 text-green-500 border-green-500/30'}
                                        `}
                                        title={`Risk Score: ${scan.score}/100`}
                                    >
                                        {scan.score}
                                    </div>
                                    <div className="mt-2 text-sm font-medium">
                                        {scan.score >= 80 ? 'High Risk' :
                                            scan.score >= 50 ? 'Medium Risk' :
                                                scan.score >= 20 ? 'Low Risk' : 'Safe'}
                                    </div>
                                </div>
                            )}
                            <div className="w-full bg-card/20 rounded-xl p-4 border border-border/20 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-primary/10 rounded-full p-2">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-lg truncate max-w-[20rem]" title={scan.fileName}>{scan.fileName}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium uppercase">{scan.fileName.split('.').pop()?.toUpperCase() || ''}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                ${scan.status === 'done' ? 'bg-green-500/20 text-green-500' :
                                                    scan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        scan.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                                                            'bg-red-500/20 text-red-500'}`}>
                                                {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                                            </span>
                                            {scan.malwareStatus && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${scan.malwareStatus === 'Clean' ? 'bg-green-500/20 text-green-500' :
                                                        scan.malwareStatus === 'Malicious' ? 'bg-red-500/20 text-red-500' :
                                                            'bg-yellow-500/20 text-yellow-500'}`}>
                                                    {scan.malwareStatus}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div className="bg-background/50 p-2 rounded-lg">
                                        <span className="text-muted-foreground block text-xs">Size</span>
                                        <span className="font-mono">{typeof scan.size === 'number' && scan.size > 0 ? formatBytes(scan.size) : 'Unknown'}</span>
                                    </div>
                                    <div className="bg-background/50 p-2 rounded-lg">
                                        <span className="text-muted-foreground block text-xs">Uploaded</span>
                                        <span className="font-mono">{new Date(scan.createdAt).toLocaleString()}</span>
                                    </div>
                                    {scan.updatedAt && (
                                        <div className="bg-background/50 p-2 rounded-lg">
                                            <span className="text-muted-foreground block text-xs">Last Updated</span>
                                            <span className="font-mono">{new Date(scan.updatedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="bg-background/50 p-2 rounded-lg">
                                        <span className="text-muted-foreground block text-xs">Scan ID</span>
                                        <div className="flex items-center">
                                            <span className="font-mono text-xs truncate">{scan.scanId.substring(0, 12)}...</span>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 ml-1" aria-label="Copy Scan ID" onClick={() => navigator.clipboard.writeText(scan.scanId)}>
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Copy Scan ID</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {Boolean(scan.result) && (
                                <div className="w-full mt-6">
                                    <Tabs defaultValue="formatted" className="w-full">
                                        <TabsList className="mb-4 bg-card/30 p-1 rounded-full border border-border/20 mx-auto">
                                            <TabsTrigger value="formatted" className="rounded-full flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                <span>Formatted Report</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="raw" className="rounded-full flex items-center gap-1">
                                                <Code className="w-4 h-4" />
                                                <span>Raw JSON</span>
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="formatted" className="mt-0">
                                            <div className="bg-card/20 rounded-lg p-4 border border-border/20">
                                                <FormattedReport result={scan.result as unknown} />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="raw" className="mt-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white/80 font-semibold">Raw Scan Results</span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Copy Raw Results" onClick={() => navigator.clipboard.writeText(rawResultString)}>
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <pre className="bg-slate-900 text-green-200 rounded-lg p-4 overflow-x-auto text-xs max-h-96 whitespace-pre-wrap shadow-inner border border-slate-700">
                                                {typeof scan.result === "string"
                                                    ? scan.result
                                                    : JSON.stringify(scan.result, null, 2)}
                                            </pre>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}
                        </div>
                    </TooltipProvider>
                )}
            </section>

        </main>
    );
}