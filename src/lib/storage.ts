import CryptoJS from 'crypto-js';

const SECRET_KEY = 'prepai-super-secret-key-2026';

export const secureStorage = {
  setItem: (key: string, value: any) => {
    const jsonString = JSON.stringify(value);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  },
  getItem: (key: string, defaultValue: any = null) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultValue;
    
    try {
      // Try to parse as normal JSON first for backward compatibility
      if (encrypted.startsWith('[') || encrypted.startsWith('{')) {
          return JSON.parse(encrypted);
      }
      
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedStr) return defaultValue;
      
      return JSON.parse(decryptedStr);
    } catch (error) {
      console.error(`Error decrypting storage key: ${key}`, error);
      return defaultValue;
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
