"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PDFExporter, pdfDefaultSchemaMappings } from "@blocknote/xl-pdf-exporter";
import { PDFViewer as ReactPdfViewer } from "@react-pdf/renderer";
import { defaultBlockSchema } from "@blocknote/core";
import type { DocumentProps } from "@react-pdf/renderer";

export default function PDFViewerClient({ blockContentString }: { blockContentString: string }) {
    const [pdfDocument, setPdfDocument] = useState<React.ReactElement<DocumentProps> | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const blockContent = useMemo(() => {
        try {
            const parsed = JSON.parse(blockContentString);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error("Invalid blockContent JSON:", err);
            setError("Invalid content.");
            return [];
        }
    }, [blockContentString]);

    useEffect(() => {
        let cancelled = false;

        const generate = async () => {
            if (!blockContent || blockContent.length === 0) {
                setPdfDocument(null);
                return;
            }

            setIsGenerating(true);
            try {
                const exporter = new PDFExporter(defaultBlockSchema as any, pdfDefaultSchemaMappings as any);
                const doc = (await exporter.toReactPDFDocument(blockContent)) as React.ReactElement<DocumentProps>;
                if (!cancelled && mountedRef.current) {
                    setPdfDocument(doc);
                }
            } catch (err) {
                console.error("Failed to generate PDF:", err);
                if (!cancelled && mountedRef.current) setError("Failed to generate PDF.");
            } finally {
                if (!cancelled && mountedRef.current) setIsGenerating(false);
            }
        };

        generate();

        return () => {
            cancelled = true;
        };
    }, [blockContent]);

    if (error) {
        return (
            <div className="min-h-[100vh] w-full flex items-center justify-center">
                {error}
            </div>
        );
    }

    if (isGenerating || !pdfDocument) {
        return (
            <div className="min-h-[100vh] w-full flex items-center justify-center">
                Generating PDF…
            </div>
        );
    }

    return (
        <div className="h-[100vh] w-[100vw] flex flex-col">
            <div className="flex-1">
                <ReactPdfViewer style={{ width: "100%", height: "100%" }}>
                    {pdfDocument}
                </ReactPdfViewer>
            </div>
        </div>
    );
}
