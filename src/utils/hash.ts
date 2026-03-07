export const getFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Use native browser cryptography API
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};
