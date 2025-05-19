import Footer from "@/components/features/footer";
import Navbar from "@/components/features/navbar";
import React from 'react';

interface Props {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex flex-col items-center">
            <Navbar />
            <main className="flex-1 flex flex-col w-full">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout