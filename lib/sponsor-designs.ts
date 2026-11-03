export const maxSponsorDesignBytes = 4 * 1024 * 1024;

const fileSignatures = {
  "image/jpeg": (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes: Uint8Array) => bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10",
  "image/webp": (bytes: Uint8Array) => bytes.slice(0, 4).toString() === "82,73,70,70" && bytes.slice(8, 12).toString() === "87,69,66,80",
  "application/pdf": (bytes: Uint8Array) => bytes.slice(0, 5).toString() === "37,80,68,70,45",
} as const;

export type SponsorDesignContentType = keyof typeof fileSignatures;

export async function validateSponsorDesign(file: File) {
  if (file.size === 0 || file.size > maxSponsorDesignBytes) return null;

  const signature = fileSignatures[file.type as SponsorDesignContentType];
  if (!signature) return null;

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return signature(bytes) ? file.type as SponsorDesignContentType : null;
}

export function sponsorDesignExtension(contentType: SponsorDesignContentType) {
  switch (contentType) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "application/pdf": return "pdf";
  }
}