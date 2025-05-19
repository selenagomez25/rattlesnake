"use client";

import { useEffect } from "react";
import { Gradient } from "@/ext/gradient";

export function MeshGradient() {
    useEffect(() => {
        const gradient = new Gradient();
        // @ts-expect-error cba to fix this
        gradient.initGradient("#gradient-canvas");
    }, []);

    return (
        <canvas
            id="gradient-canvas"
            className="fixed inset-0 w-full h-full transition-all duration-500 pointer-events-none -z-10"
            style={{
                "--gradient-color-1": "#080808", // near black
                "--gradient-color-2": "#101010", // dark gray
                "--gradient-color-3": "#181818", // medium gray
                "--gradient-color-4": "#0c0c0c", // dark gray
                opacity: 0.6,
            } as React.CSSProperties}
            data-transition-in
        />
    );
}