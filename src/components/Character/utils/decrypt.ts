async function generateAESKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer);
  return crypto.subtle.importKey(
    "raw",
    hashedPassword,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
}

export const decryptFile = async (
  url: string,
  password: string,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Unable to load encrypted model (${response.status})`);
  }

  const encryptedData = await response.arrayBuffer();
  if (encryptedData.byteLength <= 16) {
    throw new Error("Encrypted model data is invalid.");
  }

  const iv = new Uint8Array(encryptedData, 0, 16);
  const data = new Uint8Array(encryptedData, 16);
  const key = await generateAESKey(password);
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
};
