"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { Avatar } from "@/components/Avatar";
import { uploadPhotoAction, removePhotoAction } from "@/app/dashboard/actions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload";

async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.9),
  );
}

function isHeic(file: File): boolean {
  return /image\/(heic|heif)/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export function PhotoUploader({
  userId,
  name,
  photoUrl,
}: {
  userId: string;
  name: string;
  photoUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`Image must be under ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    setError(null);

    let blob: Blob = file;
    // HEIC/HEIF can't render in most browsers — convert to JPEG first so the
    // cropper can display it.
    if (isHeic(file)) {
      setConverting(true);
      try {
        const heic2any = (await import("heic2any")).default as (opts: {
          blob: Blob;
          toType?: string;
          quality?: number;
        }) => Promise<Blob | Blob[]>;
        const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        blob = Array.isArray(out) ? out[0] : out;
      } catch {
        setConverting(false);
        setError("Couldn't read that HEIC image. Try exporting it as JPG or PNG.");
        return;
      }
      setConverting(false);
    }

    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(blob);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const save = async () => {
    if (!src || !area) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(src, area);
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const res = await uploadPhotoAction(fd);
      if (!res.ok) setError(res.error || "Upload failed.");
      else {
        setSrc(null);
        router.refresh();
      }
    } catch {
      setError("Something went wrong processing the image.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    await removePhotoAction(userId);
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar name={name || "Profile"} photoUrl={photoUrl} size={112} />

      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => inputRef.current?.click()}
          disabled={busy || converting}
        >
          {converting ? "Converting…" : photoUrl ? "Change photo" : "Add photo"}
        </button>
        {photoUrl && (
          <button
            type="button"
            className="btn-ghost text-danger"
            onClick={remove}
            disabled={busy || converting}
          >
            Remove
          </button>
        )}
      </div>
      <p className="hint text-center">
        Optional. Shown as a circle. JPG, PNG, WebP, or HEIC · max {MAX_UPLOAD_MB} MB.
      </p>
      {error && <p className="field-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        hidden
        onChange={onFile}
      />

      {src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-md overflow-hidden">
            <div className="relative h-72 w-full bg-black">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-3 p-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-icao-blue"
                aria-label="Zoom"
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setSrc(null)} disabled={busy}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={save} disabled={busy}>
                  {busy ? "Saving…" : "Save photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
