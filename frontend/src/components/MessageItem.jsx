import React from 'react';
import api from '../api/api';
import { decryptAudio } from '../services/crypto.client';

export default function MessageItem({ msg, refresh }) {
  const play = async () => {
    const privateKey = localStorage.getItem('privateKey');
    const buf = await decryptAudio(msg, privateKey);
    new Audio(URL.createObjectURL(new Blob([buf],{type:'audio/webm'}))).play();
  };

  const del = async () => { await api.delete(`/messages/${msg.id}`); refresh(); };

  return (
    <li className="message-item">
      <div>
        <strong>{msg.sender}</strong> → <strong>{msg.recipient}</strong>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          {new Date(msg.createdAt).toLocaleString()}
        </div>
      </div>
      <div>
        <button onClick={play}>Écouter</button>
        <button onClick={del} className="danger">Supprimer</button>
      </div>
    </li>
  )
}
