'use client';
import { useEffect, useRef } from "react";

export default function ApiDocsPage() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function renderRedoc() {
            // @ts-expect-error redoc cdn used and not typed
            if (window.Redoc && ref.current) {
                // @ts-expect-error redoc cdn used and not typed
                window.Redoc.init('/api/openapi', {
                    hideDownloadButton: true,
                    hideLoading: false,
                    hideHostname: true,
                    hideSearch: false,
                }, ref.current);
            }
        }

        if (!document.getElementById('redoc-script')) {
            const script = document.createElement('script');
            script.id = 'redoc-script';
            script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
            script.onload = renderRedoc;
            document.body.appendChild(script);
        } else {
            renderRedoc();
        }
    }, []);

    return (
        <main className="flex flex-col items-center min-h-screen w-full px-4">
            <div className="w-full max-w-5xl mx-auto my-10">
                <h1 className="text-3xl font-bold mb-2 text-foreground">API Documentation</h1>
                <div
                    ref={ref}
                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-border p-4 min-h-[70vh]"
                />
            </div>
        </main>
    );
}