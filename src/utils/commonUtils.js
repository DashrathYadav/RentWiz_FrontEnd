import CryptoJS from 'crypto-js';

// Function to encrypt JWT token data
export const encryptData = (data) => {
  const encData = CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_APP_SECRETPASSKEY).toString();
  return encData;
};

// Function to decrypt JWT token data
export const decryptData = (token) => {
  const bytes = CryptoJS.AES.decrypt(token, import.meta.env.VITE_APP_SECRETPASSKEY);
  const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return data;
};

// Function to encrypt id
export const encryptID = (num, key) => {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate random IV
    const encrypted = CryptoJS.AES.encrypt(num.toString(), CryptoJS.enc.Utf8.parse(key), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    // Convert encrypted result to hex to avoid special characters
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Hex);
};

// Function to decrypt id
export const decryptID = (encryptedNum, key) => {
    // Convert from hex to WordArray
    const encryptedHex = CryptoJS.enc.Hex.parse(encryptedNum);
    // Extract IV
    const iv = encryptedHex.clone();
    iv.sigBytes = 16;
    iv.clamp();
    // Extract ciphertext
    const ciphertext = encryptedHex.clone();
    ciphertext.words.splice(0, 4); // Remove IV from ciphertext
    ciphertext.sigBytes -= 16;
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, CryptoJS.enc.Utf8.parse(key), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return parseInt(decrypted.toString(CryptoJS.enc.Utf8));
};