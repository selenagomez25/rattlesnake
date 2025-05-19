'use client';

import Navbar from '@/components/features/navbar';
import Footer from '@/components/features/footer';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

const ApiDocsLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center w-full px-4">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default ApiDocsLayout; 