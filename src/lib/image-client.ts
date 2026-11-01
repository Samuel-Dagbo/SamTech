/**
 * Client-side image pipeline restored from the legacy Vite dashboard
 * (src/utils/image.js): reads a file, downscales to `maxWidth`, and encodes
 * the result as a WebP data URL for direct storage in the profile document.
 * Requires a browser environment (Image, FileReader, canvas).
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1400,
  quality = 0.72,
): Promise<string> {
  if (!file) {
    return "";
  }

  const fileDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to process image."));
    img.src = fileDataUrl;
  });

  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create canvas context.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/webp", quality);
}
