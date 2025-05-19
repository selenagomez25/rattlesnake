import { Metadata } from "next";

interface MetadataProps {
    title?: string;
    description?: string;
    icons?: Metadata["icons"];
    noIndex?: boolean;
    keywords?: string[];
    author?: string;
    twitterHandle?: string;
    type?: "website" | "article" | "profile";
    locale?: string;
    alternates?: Record<string, string>;
    publishedTime?: string;
    modifiedTime?: string;
}

export const generateMetadata = ({
    title = `Rattlesnake - Scanner for Minecraft Mods`,
    description = `Rattlesnake is a modern malware and RAT scanner for Minecraft mods. Instantly scan .jar files for malware, obfuscation, and suspicious code, built for the Minecraft community.`,
    keywords = [
        "malware scanner",
        "rat scanner",
        "minecraft mod security",
        "virus scan",
        "jar file analysis",
        "obfuscation detection",
        "mod safety",
        "rattlesnake",
        "minecraft malware"
    ],
    author = "patho.s",
}: MetadataProps = {}): Metadata => {
    return {
        title: {
            template: `%s | rattlesnake` ,
            default: title
        },
        description,
        keywords,
        authors: [{ name: author }],
        creator: author,
        publisher: "Rattlesnake",
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
    };
};