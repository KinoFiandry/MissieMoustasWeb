// backend/models/message.model.js
import mongoose from 'mongoose';

// Schéma message : liens vers sender/recipient, audio chiffré, IV, clé AES chiffrée, hash SHA-256
const MessageSchema = new mongoose.Schema({
  sender:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audio:           { type: Buffer, required: true },  
  iv:              { type: Buffer, required: true },
  encryptedAesKey: { type: Buffer, required: true },
  hash:            { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);
