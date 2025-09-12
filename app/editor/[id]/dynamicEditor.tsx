"use client";

import dynamic from "next/dynamic";

export const Editor = dynamic(
    () => import("./editor").then((mod) => mod.default),
    { ssr: false }
);
