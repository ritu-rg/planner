// ============ ENCRYPTION UTILITIES ============

// Generate encryption key from password using PBKDF2
const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Encrypt data with password
export const encryptData = async (data, password) => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      encryption: {
        algorithm: 'AES-GCM',
        iv: Array.from(iv),
        salt: Array.from(salt)
      },
      data: Array.from(new Uint8Array(encryptedData))
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data with password
export const decryptData = async (encryptedPayload, password) => {
  try {
    const salt = new Uint8Array(encryptedPayload.encryption.salt);
    const iv = new Uint8Array(encryptedPayload.encryption.iv);
    const encryptedData = new Uint8Array(encryptedPayload.data);

    const key = await deriveKey(password, salt);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - incorrect password or corrupted file');
  }
};
