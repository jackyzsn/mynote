import CryptoJS from "react-native-crypto-js";

export function encrypt(text, key) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext, key) {
  let bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
