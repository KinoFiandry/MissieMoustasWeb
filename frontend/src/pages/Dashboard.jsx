// src/pages/Dashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import AudioRecorder from '../components/AudioRecorder';
import './Dashboard.css';
import { decryptAudio } from '../services/crypto.client';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageKeys, setMessageKeys] = useState({});
  const [secure, setSecure] = useState(true);

  // Load users
  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  // Load messages and initialize keys
  useEffect(() => {
    api.get('/messages').then(res => {
      setMessages(res.data);
      const keys = {};
      res.data.forEach(m => { keys[m.id] = m.encryptedAesKey; });
      setMessageKeys(keys);
    });
  }, []);

  // Send handler
  const handleSend = async (audioBase64) => {
    if (!selectedRecipient) return alert('Sélectionnez un destinataire');
    try {
      const { data: newMsg } = await api.post('/messages', { recipientId: selectedRecipient, audioBase64 });
      setMessages(prev => [newMsg, ...prev]);
      setMessageKeys(prev => ({ ...prev, [newMsg.id]: newMsg.encryptedAesKey }));
      setSecure(true);
      alert('Message envoyé avec succès');
    } catch {
      setSecure(false);
      alert('Erreur lors de l\'envoi');
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      setSecure(true);
    } catch {
      setSecure(false);
      alert('Erreur lors de la suppression');
    }
  };

  // Decrypt handler
  const handleDecrypt = async (msg) => {
    try {
      const privateKey = localStorage.getItem('privateKey');
      const buf = await decryptAudio(msg, privateKey);
      new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/webm' }))).play();
      setSecure(true);
      alert('Décryptage réussi. Lecture en cours.');
    } catch {
      setSecure(false);
      alert('Échec du décryptage.');
    }
  };

  // Split messages
  const received = messages.filter(m => m.recipientId === user.id);
  const sent     = messages.filter(m => m.senderId    === user.id);

  return (
    
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <img src={user.avatar || '/avatar.png'} alt="avatar" className="avatar" />
          <div>
            <h2 className="username">{user.fullName || user.id}</h2>
            <span className="status online">Online</span>
          </div>
        </div>
        {user.role === 'admin' && (
        <Link to="/admin/users" className="btn admin-btn">
          Panel Admin
        </Link>
      )}
        <div className="security-status">
          <span className={`indicator ${secure ? 'secure' : 'insecure'}`}></span>
          <span>{secure ? 'Connexion sécurisée' : 'Problème de connexion'}</span>
        </div>
        
        <button className="btn logout" onClick={logout}>Déconnexion</button>
      </header>

      <section className="recorder-section">
        <h3>Enregistrer & Chiffrer</h3>
        <div className="controls">
          <AudioRecorder onSend={handleSend} disabled={!selectedRecipient} />
          <label>
            Destinataire :
            <select
              value={selectedRecipient}
              onChange={e => setSelectedRecipient(e.target.value)}
              className="recipient-select"
            >
              <option value="">-- Sélectionner --</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.fullName}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="messages-section">
        <h3>Messages reçus</h3>
        <ul className="message-list">
          {received.map(m => (
            <li key={m.id} className="message-item">
              <div>
                <strong>De :</strong> {m.senderName}<br />
                <strong>Date :</strong> {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className="decrypt-group">
                <input
                  type="text"
                  readOnly
                  value={messageKeys[m.id] || ''}
                  className="decrypt-input"
                />
                <button onClick={() => handleDecrypt(m)} className="btn decrypt-btn">Déchiffrer & Écouter</button>
                <button onClick={() => handleDelete(m.id)} className="btn delete-btn">Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="messages-section">
        <h3>Messages envoyés</h3>
        <ul className="message-list">
          {sent.map(m => (
            <li key={m.id} className="message-item">
              <div>
                <strong>À :</strong> {m.recipientName}<br />
                <strong>Date :</strong> {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className="decrypt-group">
                <input
                  type="text"
                  readOnly
                  value={messageKeys[m.id] || ''}
                  className="decrypt-input"
                />
                <button onClick={() => handleDecrypt(m)} className="btn decrypt-btn">Écouter</button>
                <button onClick={() => handleDelete(m.id)} className="btn delete-btn">Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
