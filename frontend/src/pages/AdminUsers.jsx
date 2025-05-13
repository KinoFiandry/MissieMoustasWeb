import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import './AdminUsers.css';

export default function AdminUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  if (user.role !== 'admin') {
       return <p>Accès non autorisé</p>;
  }
  const fetchUsers = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async e => {
    e.preventDefault();
    await api.post('/admin/users', form);
    setForm({ fullName: '', username: '', email: '', password: '' });
    fetchUsers();
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const startEdit = user => {
    setEditingId(user._id);
    setForm({ fullName: user.fullName, username: user.username, email: user.email, password: '' });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    await api.put(`/admin/users/${editingId}`, form);
    setEditingId(null);
    setForm({ fullName: '', username: '', email: '', password: '' });
    fetchUsers();
  };

  return (
    <div className="admin-users">
      <h2>Gestion des utilisateurs</h2>
      <form onSubmit={editingId ? handleUpdate : handleCreate} className="user-form">
        <input name="fullName" placeholder="Nom complet" value={form.fullName} onChange={handleChange} required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required={!editingId}
        />
        <button type="submit" className="btn create-btn">{editingId ? 'Mettre à jour' : 'Créer'}</button>
        {editingId && <button type="button" className="btn cancel-btn" onClick={() => { setEditingId(null); setForm({ fullName: '', username: '', email: '', password: '' }); }}>Annuler</button>}
      </form>
      <table className="users-table">
        <thead>
          <tr><th>Nom</th><th>Username</th><th>Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <button className="btn edit-btn" onClick={() => startEdit(u)}>Éditer</button>
                <button className="btn delete-btn" onClick={() => handleDelete(u._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}