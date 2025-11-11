import React, { useRef, useState } from "react";
import { uploadData, getUrl } from "aws-amplify/storage";

type Props = {
  targetPrefix: string; // e.g., `${orgID}/boxes/${boxID}/`
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  onUploaded?: (keys: string[], urls: string[]) => void;
};

export default function UploadDropzone({ targetPrefix, accept="image/*", maxFiles=10, maxSizeMB=5, onUploaded }: Props) {
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
        const key = `${targetPrefix}${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;
        await uploadData({ path: key, data: f }).result;
        keys.push(key);
        const u = await getUrl({ path: key });
        urls.push(String(u?.url));
      }
      onUploaded?.(keys, urls);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
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
