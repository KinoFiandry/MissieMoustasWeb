// frontend/src/pages/Signup.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validation client
    const { fullName, username, email, password, confirmPassword } = form;
    if (!fullName || !username || !email || !password || !confirmPassword) {
      return setError('Veuillez remplir tous les champs.');
    }
    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    if (password.length < 8) {
      return setError('Le mot de passe doit contenir au moins 8 caractères.');
    }
    setLoading(true);
    try {
      await signup(fullName, username, email, password, confirmPassword);
      alert('🎉 Inscription réussie !');
      window.location = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Inscription</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          placeholder="Nom complet"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="username"
          placeholder="Nom d’utilisateur"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'S’inscrire'}
        </button>
      </form>
    </div>
  );
}
