import CryptoJS from 'react-native-crypto-js';

export function encrypt(text: string, key: string) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext: string, key: string) {
  let bytes = CryptoJS.AES.decrypt(ciphertext, key);

  return bytes.toString(CryptoJS.enc.Utf8);
}
