import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem('token');
  const id    = localStorage.getItem('userId');
  const username = localStorage.getItem('username'); // <— nouveau
  const role  = localStorage.getItem('role');
  if (token && id && role) {
    setUser({ id, username, role });
  }
}, []);

  async function login(usernameOrEmail, password) {
  const { data } = await api.post('/auth/login', { usernameOrEmail, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('userId', data.userId);
  localStorage.setItem('username', data.username);   // <— nouveau
  localStorage.setItem('role', data.role);
  setUser({ id: data.userId, username: data.username, role: data.role });
}

  async function signup(fullName, username, email, password, confirmPassword) {
    const { data } = await api.post('/auth/signup', { fullName, username, email, password, confirmPassword });
    localStorage.setItem('privateKey', data.privateKey);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    window.location = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
