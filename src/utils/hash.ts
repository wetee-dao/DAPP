import { blake2b } from '@noble/hashes/blake2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

/**
 * 浏览器中计算字符串的 BLAKE2b 哈希
 * @param {string} input - 待哈希的字符串
 * @param {number} outputLength - 哈希输出长度（1-64 字节，默认 64 字节=512位）
 * @returns {string} 十六进制格式的 BLAKE2b 哈希
 */
export function blake2bHash(input: string, outputLength = 64) {
  // 2. 将字符串转换为 UTF-8 编码的 Uint8Array（浏览器原生 API）
  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(input);

  // 3. 计算 BLAKE2b 哈希（dkLen 指定输出长度）
  const hashBytes = blake2b(inputBytes, { dkLen: outputLength });

  // 4. 将 Uint8Array 转换为十六进制字符串（便于展示和传输）
  return bytesToHex(hashBytes);
}
