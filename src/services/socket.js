import { io } from 'socket.io-client';
import { useLogin } from '../contexts/LoginContext';

export const createSocketConnection = () => {
  const { token } = useLogin();
  
  const socket = io("http://localhost:5000", {
    auth: {
      token: token
    }
  });

  return socket;
}; 