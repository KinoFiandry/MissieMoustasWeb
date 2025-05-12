// backend/routes/messages.js
import express from 'express';
import Message from '../models/message.model.js';
import { authUser } from '../middlewares/auth.middleware.js';
import { encryptMessage } from '../services/crypto.service.js';


const router = express.Router();
router.use(authUser);


// POST create + encrypt
router.post('/', async (req, res) => {
  const { recipientId, audioBase64 } = req.body;
  if (!recipientId) {
    return res.status(400).json({ message: 'recipientId is required' });
  }

  // 1. Chiffrement
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const { encryptedAudio, iv, encryptedAesKey, hash } =
    await encryptMessage(req.user.id, recipientId, audioBuffer);

  // 2. Sauvegarde
  const msg = await Message.create({
    sender:      req.user.id,
    recipient:   recipientId,
    audio:       encryptedAudio,
    iv,
    encryptedAesKey,
    hash
  });

  // 3. Population en un seul appel
  await msg.populate([
    { path: 'sender',    select: 'fullName' },
    { path: 'recipient', select: 'fullName' }
  ]);

  // 4. Réponse
  res.status(201).json({
    id:              msg._id.toString(),
    senderId:        msg.sender._id.toString(),
    senderName:      msg.sender.fullName,
    recipientId:     msg.recipient._id.toString(),
    recipientName:   msg.recipient.fullName,
    iv:              msg.iv.toString('base64'),
    encryptedAesKey: msg.encryptedAesKey.toString('base64'),
    audio:           msg.audio.toString('base64'),
    hash:            msg.hash,
    createdAt:       msg.createdAt
  });
});

// GET list (sender ou recipient), paginée
router.get('/', authUser, async (req, res) => {
  const msgs = await Message.find({
    $or: [{ sender: req.user.id }, { recipient: req.user.id }]
  })
    .populate('sender',   'fullName')
    .populate('recipient','fullName')
    .sort('-createdAt');

  res.json(msgs.map(m => ({
    id:            m._id.toString(),
    senderId:      m.sender._id.toString(),
    senderName:    m.sender.fullName,
    recipientId:   m.recipient._id.toString(),
    recipientName: m.recipient.fullName,
    iv:            m.iv.toString('base64'),
    encryptedAesKey:m.encryptedAesKey.toString('base64'),
    audio:         m.audio.toString('base64'),
    hash:          m.hash,
    createdAt:     m.createdAt
  })));
});

// PUT (optionnel) update message
router.put('/:id', async (req, res) => {
  const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(msg);
});

// DELETE message
router.delete('/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
