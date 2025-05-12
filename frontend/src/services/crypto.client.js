// frontend/src/services/crypto.client.js
// Utilise SubtleCrypto pour RSA-OAEP + AES-CBC + hash

export async function decryptAESKey(encryptedAesKeyB64, privateKeyPem) {
  // 1. Import de la clé privée
  const privKey = await window.crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKeyPem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );

  // 2. Conversion Base64 → ArrayBuffer
  const encKeyBuf = Uint8Array.from(atob(encryptedAesKeyB64), c => c.charCodeAt(0)).buffer;

  // 3. Décryptage RSA-OAEP
  const aesKeyRaw = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privKey,
    encKeyBuf
  );

  // 4. Conversion en chaîne hex
  return Array.from(new Uint8Array(aesKeyRaw))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
export async function decryptAudio(msg, privateKeyPem) {
  // 1. Import clé privée
  const privKey = await window.crypto.subtle.importKey(
    'pkcs8',
    str2ab(privateKeyPem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false, ['decrypt']
  );
  // 2. Déchiffre la clé AES
  const aesKeyRaw = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privKey,
    abFromB64(msg.encryptedAesKey)
  );
  const aesKey = await window.crypto.subtle.importKey(
    'raw', aesKeyRaw, { name: 'AES-CBC' }, false, ['decrypt']
  );
  // 3. Déchiffre l’audio
  const audioBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: abFromB64(msg.iv) },
    aesKey,
    abFromB64(msg.audio)
  );
  return audioBuf;
}
// src/services/crypto.client.js


// (Votre fonction existante decryptAudio reste inchangée)


// Helpers Base64 ↔ ArrayBuffer
function abFromB64(b64) { return Uint8Array.from(atob(b64), c=>c.charCodeAt(0)).buffer; }
function str2ab(str) { return new TextEncoder().encode(str).buffer; }
