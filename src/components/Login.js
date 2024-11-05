import React, { useState } from 'react';
import { useLogin } from '../contexts/LoginContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const { login } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email);
      // Handle successful login (e.g., redirect)
    } catch (error) {
      // Handle login error
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login; 