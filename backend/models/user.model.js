// backend/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail.js';

const UserSchema = new mongoose.Schema({
  fullName:   { type: String, required: true, trim: true },
  username:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  email:      { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    validate: {
      validator: value => isEmail(value),
      message: 'Email invalide'
    }
  },
  password:   { type: String, required: true, minlength: 8 },
  publicKey:  { type: String, required: true },
  role:       { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    // Si l'un des arguments est manquant, on lève une erreur explicite
    throw new Error('data and hash arguments required');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
