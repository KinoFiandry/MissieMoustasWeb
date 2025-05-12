import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { decryptAudio } from '../services/crypto.client';
import './MessageList.css';

export default function MessageList() {
  const [msgs, setMsgs] = useState([]);
  const [password, setPassword] = useState('');

  useEffect(() => {
    api.get('/messages').then(res => setMsgs(res.data));
  }, []);

  const handleDecrypt = async (msg) => {
    const buf = await decryptAudio(msg, password);
    new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/webm' }))).play();
  };

  return (
    <div>
      <input
        type="password"
        placeholder="Decryption key"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="decrypt-input"
      />
      <ul className="message-list">
        {msgs.map(m => (
          <li key={m.id} className="message-item">
            <div>
              <strong>From:</strong> {m.sender}
              <br />
              <strong>Date:</strong> {new Date(m.createdAt).toLocaleString()}
            </div>
            <button
              onClick={() => handleDecrypt(m)}
              className="btn decrypt-btn"
            >
              Decrypt & Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
