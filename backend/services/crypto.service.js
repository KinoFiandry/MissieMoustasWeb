// backend/services/crypto.service.js
import { randomBytes, createCipheriv, createHash, publicEncrypt, privateDecrypt } from 'crypto';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';

/**
 * Chiffre un Buffer audio pour un destinataire
 * - AES-256-CBC pour le payload
 * - RSA-OAEP pour la clé AES
 * - SHA-256 pour l’intégrité
 */
export async function encryptMessage(senderId, recipientId, audioBuffer) {
  // 1. Génération d’une clé AES-256 et IV
  const aesKey = randomBytes(32);
  const iv     = randomBytes(16);

  // 2. Chiffrement AES du buffer audio
  const cipher = createCipheriv('aes-256-cbc', aesKey, iv);
  const encryptedAudio = Buffer.concat([cipher.update(audioBuffer), cipher.final()]);

  // 3. Récupération de la clé publique du destinataire
  const { publicKey } = await User.findById(recipientId);

  // 4. Chiffrement de la clé AES via RSA-OAEP
  const encryptedAesKey = publicEncrypt(publicKey, aesKey);

  // 5. Hash SHA-256 pour intégrité
  const hash = createHash('sha256').update(encryptedAudio).digest('hex');

  return { encryptedAudio, iv, encryptedAesKey, hash };
}

/**
 * Déchiffre un message complet côté serveur
 */
export async function decryptMessage(messageId, privateKeyPem) {
  const msg = await Message.findById(messageId);
  // 1. Déchiffrement de la clé AES
  const aesKey = privateDecrypt(privateKeyPem, msg.encryptedAesKey);
  // 2. Déchiffrement du buffer audio
  const decipher = createCipheriv('aes-256-cbc', aesKey, msg.iv);
  const audioBuffer = Buffer.concat([decipher.update(msg.audio), decipher.final()]);
  // 3. Vérification d’intégrité
  const hash = createHash('sha256').update(msg.audio).digest('hex');
  if (hash !== msg.hash) throw new Error('Echec de l’intégrité');
  return audioBuffer;
}
