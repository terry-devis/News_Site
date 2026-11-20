// Client-side WebP compression & resizing before uploading to Cloudflare R2
// Reduces multi-MB PNG/JPG photos to ~80-180 KB WebP images with zero native server deps.

export async function optimizeImageToWebP(file, { maxWidth = 1600, quality = 0.82 } = {}) {
  if (!file || typeof window === "undefined") return file;
  const type = (file.type || "").toLowerCase();

  // Skip animated GIFs, SVGs, or non-image files
  if (!type.startsWith("image/") || type === "image/gif" || type === "image/svg+xml") {
    return file;
  }

  // If already a small WebP under 150 KB, upload as-is
  if (type === "image/webp" && file.size <= 150 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    let targetW = bitmap.width;
    let targetH = bitmap.height;

    if (targetW > maxWidth) {
      const ratio = maxWidth / targetW;
      targetW = maxWidth;
      targetH = Math.round(targetH * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const webpBlob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality)
    );

    if (!webpBlob || webpBlob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([webpBlob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
