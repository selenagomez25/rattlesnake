"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Menu, X, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/api-docs", label: "API Docs" },
];

const Navbar = () => {
    const { data: session, status } = useSession();

    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navbarVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <motion.header
            initial="hidden"
            animate="visible"
            variants={navbarVariants}
            className={`sticky top-0 w-full h-16 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? "bg-background/90 backdrop-blur-md border-border/30"
                    : "bg-background/80 backdrop-blur-sm border-border/20"
            }`}
        >
            <Wrapper className="h-full">
                <div className="flex items-center h-full px-2 md:px-6">
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <motion.span
                                className="text-xl font-medium text-foreground"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                rattlesnake
                            </motion.span>
                        </Link>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-8 ml-8">
                        <AnimatePresence>
                            {navLinks.map((link) => (
                                <motion.div
                                    key={link.href}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Link
                                        href={link.href}
                                        className={`text-sm font-medium transition-colors relative ${
                                            pathname === link.href
                                                ? "text-primary"
                                                : "hover:text-primary"
                                        }`}
                                    >
                                        {link.label}
                                        {pathname === link.href && (
                                            <motion.span
                                                layoutId="navbar-indicator"
                                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        <motion.div
                            variants={itemVariants}
                            className="hidden md:flex items-center gap-3"
                        >
                            {status === "loading" ? null : session && session.user ? (
                                <>
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Avatar className="border border-border">
                                            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                                            <AvatarFallback className="bg-secondary text-foreground">{session.user.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => signOut()}
                                            className="transition-all duration-300 hover:bg-primary/10"
                                        >
                                            Sign out
                                        </Button>
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="flex items-center gap-2 transition-all duration-300"
                                        onClick={() => signIn("github")}
                                    >
                                        <ExternalLink className="w-4 h-4" /> Sign in
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Mobile Menu */}
                        <motion.div variants={itemVariants} className="md:hidden">
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <span className="text-lg font-medium">Menu</span>
                                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex-1 overflow-auto py-4">
                                            <div className="flex flex-col space-y-3 px-4">
                                                {navLinks.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                                            pathname === link.href
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-muted"
                                                        }`}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 border-t">
                                            {status === "loading" ? null : session && session.user ? (
                                                <div className="flex flex-col space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="border border-border h-8 w-8">
                                                            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                                                            <AvatarFallback className="bg-secondary text-foreground">{session.user.name?.[0] || "U"}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium">{session.user.name || "User"}</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => signOut()}
                                                        className="w-full"
                                                    >
                                                        Sign out
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="w-full flex items-center justify-center gap-2"
                                                    onClick={() => signIn("github")}
                                                >
                                                    <ExternalLink className="w-4 h-4" /> Sign in with GitHub
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </motion.div>
                    </div>
                </div>
            </Wrapper>
        </motion.header>
    );
};

export default Navbar;
