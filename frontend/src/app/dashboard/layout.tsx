'use client';

import { useSession } from 'next-auth/react';
import Footer from "@/components/features/footer";
import Navbar from "@/components/features/navbar";
import React from "react";

interface Props {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
    const { data: session, status } = useSession();
    if (status === 'loading') return null;

    const isSignedIn = !!session?.user;

    return (
        <div className="min-h-screen flex flex-col">
            {isSignedIn && <Navbar />}
            <main className="flex-1 flex flex-col items-center justify-center w-full">{children}</main>
            {isSignedIn && <Footer />}
        </div>
    );
};

export default DashboardLayout; 