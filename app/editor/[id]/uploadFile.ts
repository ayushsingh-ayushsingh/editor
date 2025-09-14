const MAX_BYTES = 30 * 1024 * 1024;

export default async function uploadFile(file: File): Promise<string> {
    if (file.size > MAX_BYTES) {
        throw new Error("File too large. Maximum allowed size is 30 MB.");
    }

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body,
    });

    if (!res.ok) {
        let errText = "";
        try {
            const j = await res.json();
            errText = j?.error ?? JSON.stringify(j);
        } catch {
            errText = await res.text();
        }
        throw new Error("Upload failed: " + errText);
    }

    const json = await res.json();
    return `/api/files/${json.id}`;
}
