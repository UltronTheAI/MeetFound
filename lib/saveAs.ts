import { Capacitor, registerPlugin } from "@capacitor/core";

type SaveAsPlugin = {
  saveBase64(options: {
    base64: string;
    fileName: string;
    mimeType: string;
  }): Promise<void>;
};

const SaveAs = registerPlugin<SaveAsPlugin>("SaveAs");

export type SaveAsStatus = "saved" | "cancelled" | "unsupported" | "error";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unexpected FileReader result"));
        return;
      }

      const commaIndex = result.indexOf(",");
      if (commaIndex === -1) {
        reject(new Error("Unexpected data URL format"));
        return;
      }

      resolve(result.slice(commaIndex + 1));
    };
    reader.readAsDataURL(blob);
  });
}

function normalizeMimeType(mimeType: string) {
  const semi = mimeType.indexOf(";");
  return semi === -1 ? mimeType : mimeType.slice(0, semi);
}

export function isAndroidSaveAsSupported() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function saveBlobAsWithPicker(
  blob: Blob,
  fileName: string,
  mimeType?: string
) : Promise<SaveAsStatus> {
  if (!isAndroidSaveAsSupported()) return "unsupported";

  try {
    const base64 = await blobToBase64(blob);
    const resolvedMimeType =
      normalizeMimeType(mimeType || blob.type) || "application/octet-stream";

    await SaveAs.saveBase64({
      base64,
      fileName,
      mimeType: resolvedMimeType,
    });

    return "saved";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/cancel/i.test(message)) return "cancelled";
    return "error";
  }
}
