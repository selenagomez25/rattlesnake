import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { base, heading } from "@/constants";
import { Toaster } from "@/components/ui/sonner";
import { subheading } from "@/constants/fonts";
import { SessionProvider } from "next-auth/react";
import { generateMetadata } from "@/utils";

export const metadata = generateMetadata();

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-background text-foreground antialiased font-heading overflow-x-hidden !scrollbar-hide",
                    base.variable,
                    heading.variable,
                    subheading.variable,
                )}
            >
                <SessionProvider>
                    <Toaster richColors theme="dark" position="top-right" />
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
};