import Container from "@/components/global/container";
import Wrapper from "@/components/global/wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from 'next/link';

const NotFoundPage = () => {
    return (
        <main className="relative flex flex-col items-center justify-center px-4 h-dvh bg-background text-foreground">
            <Wrapper>
                <Container className="flex flex-col items-center justify-center mx-auto py-16">
                    <div className="flex items-center justify-center h-full flex-col">
                        <span className="text-sm px-3.5 py-1 rounded-md bg-gradient-to-br from-sky-400 to-blue-600 text-neutral-50 custom-shadow font-base">
                            404
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mt-5 font-heading">
                            Not Found
                        </h1>
                        <p className="text-base text-muted-foreground mt-5 text-center mx-auto max-w-xl font-base">
                            This page doesn&apos;t exist. Please check the URL and try again.
                        </p>
                        <Link href="/">
                            <Button variant="outline" className="mt-8 font-base">
                                <ArrowLeftIcon className="size-4" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </Container>
            </Wrapper>
            <div className="bg-gradient-to-t from-background to-transparent absolute bottom-0 inset-x-0 w-full h-1/2 pointer-events-none"></div>
        </main>
    )
};

export default NotFoundPage; 