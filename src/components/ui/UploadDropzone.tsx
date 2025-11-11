import React, { useRef, useState } from "react";
import { uploadData, getUrl } from "aws-amplify/storage";

type AccessLevel = "public" | "protected" | "private";

type Props = {
  targetPrefix: string;            // e.g. `${orgID || "public"}/branding/`
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  accessLevel?: AccessLevel;       // NEW
  onUploaded?: (keys: string[], urls: string[]) => void;
};

export default function UploadDropzone({
  targetPrefix,
  accept = "image/*",
  maxFiles = 10,
  maxSizeMB = 5,
  accessLevel = "public",          // DEFAULT to public for branding/icons
  onUploaded
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const arr = Array.from(files).slice(0, maxFiles);
    for (const f of arr) {
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`"${f.name}" exceeds ${maxSizeMB} MB`);
        return;
      }
    }

    setBusy(true);
    try {
      const keys: string[] = [];
      const urls: string[] = [];

      for (const f of arr) {
        // DO NOT prefix with "public/". Amplify adds it for us based on accessLevel.
        const key = `${targetPrefix}${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;

        // --- PUT (signed) ---
        const putRes = await uploadData({
          path: key,
          data: f,
          options: { accessLevel }
        }).result;

        // Optional: you can inspect putRes for ETag
        // console.log('PUT OK', putRes);

        keys.push(key);

        // --- GET (signed URL) ---
        const u = await getUrl({
          path: key,
          options: { accessLevel, expiresIn: 60 * 60 } // 1h
        });

        urls.push(String(u.url));
      }

      onUploaded?.(keys, urls);
    } catch (e: any) {
      // Amplify S3 errors frequently include a nested cause with XML <Code>
      const msg =
        e?.$metadata?.httpStatusCode
          ? `HTTP ${e.$metadata.httpStatusCode}: ${e.name || e.message || "Upload failed"}`
          : e?.message || "Upload failed (check CORS/IAM)";
      console.error("Upload error:", e);
      setError(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-[#1f2d5e] bg-[#0b1437] p-6 text-center">
      <div className="text-sm text-gray-300 mb-2">Drag & drop images here, or</div>
      <button onClick={() => inputRef.current?.click()} className="px-3 py-2 bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg text-sm text-white">Select files</button>
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={e => handleFiles(e.target.files)} />
      {busy && <div className="mt-3 text-xs text-gray-400">Uploading...</div>}
      {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
    </div>
  );
}
