"use client";

import {
    combineByGroup,
    filterSuggestionItems,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import * as locales from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
    getPageBreakReactSlashMenuItems,
    useCreateBlockNote,
} from "@blocknote/react";
import {
    PDFExporter,
    pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import {
    JSX,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from "react";

export default function App() {
    const [pdfDocument, setPDFDocument] = useState<JSX.Element>();
    const [renders, forceRerender] = useReducer((s) => s + 1, 0);

    // Prevent SSR crash: don’t create editor until client
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Creates a new editor instance (only after client-side mount).
    const editor = useCreateBlockNote(
        isClient
            ? {
                dictionary: {
                    ...locales.en,
                },
                tables: {
                    splitCells: true,
                    cellBackgroundColor: true,
                    cellTextColor: true,
                    headers: true,
                },
                initialContent: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Welcome to this ",
                                styles: { italic: true },
                            },
                            {
                                type: "text",
                                text: "demo!",
                                styles: { italic: true, bold: true },
                            },
                        ],
                    },
                ],
            }
            : undefined,
    );

    const getSlashMenuItems = useMemo(
        () =>
            async (query: string) =>
                filterSuggestionItems(
                    combineByGroup(
                        getDefaultReactSlashMenuItems(editor),
                        getPageBreakReactSlashMenuItems(editor),
                    ),
                    query,
                ),
        [editor],
    );

    const onChange = async () => {
        if (!editor) return;
        const schema: any = (editor as any).schema;
        const document: any = (editor as any).document;

        const exporter = new PDFExporter(schema, pdfDefaultSchemaMappings as any);
        const pdfDoc = await exporter.toReactPDFDocument(document);

        setPDFDocument(pdfDoc);
        forceRerender();
    };

    useEffect(() => {
        if (editor) {
            onChange();
        }
    }, [editor]);

    const onDownloadClick = async () => {
        if (!pdfDocument) return;
        const blob = await pdf(pdfDocument).toBlob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "My Document (blocknote export).pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);
    };

    if (!isClient || !editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className="views">
            <div className="view-wrapper">
                <div className="view-label">Editor Input</div>
                <div className="view">
                    <BlockNoteView editor={editor} slashMenu={false} onChange={onChange}>
                        <SuggestionMenuController
                            triggerCharacter={"/"}
                            getItems={getSlashMenuItems}
                        />
                    </BlockNoteView>
                </div>
            </div>
            <div className="view-wrapper">
                <div className="view-label">
                    PDF Output
                    <span className="view-label-download" onClick={onDownloadClick}>
                        Download
                    </span>
                </div>
                <div className="view h-[100vh]">
                    <PDFViewer key={renders} height={"100%"} width={"100%"}>
                        {pdfDocument}
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
}
