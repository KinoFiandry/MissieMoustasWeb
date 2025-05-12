// backend/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import { generateKeyPairSync } from 'crypto';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

// Supprime anciens, recrée un admin/admin123
await User.deleteMany({});

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Fournissez fullName et email
const admin = new User({
  fullName:  'Administrateur',
  username:  'admin',
  email:     'admin@monsite.com',
  password:  'admin123',
  publicKey,
  role:      'admin'
});

await admin.save();
console.log('Admin créé. Private key (gardez-la) :', privateKey);
process.exit();
