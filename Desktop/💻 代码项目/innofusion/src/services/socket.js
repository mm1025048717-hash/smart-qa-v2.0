import { io } from 'socket.io-client';

// Socket.IO connects to the base URL (without /api), while HTTP API uses /api
// Extract base URL from VITE_API_URL (which may include /api)
const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Remove /api suffix if present for Socket.IO connection
  return apiUrl.replace(/\/api\/?$/, '');
};

const URL = getBaseURL();

// Auto-connects, but we will manage connection manually when a user enters a project
export const socket = io(URL, {
  autoConnect: false,
});
