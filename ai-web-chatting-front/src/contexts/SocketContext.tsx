'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => void;
  sendChatMessage: (messages: any[], roomId: string, mode: 'content' | 'tool' | 'rag') => Promise<void>;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responseHandlers = useRef<Map<string, (response: any) => void>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      return;
    }

    // Create socket connection
    const newSocket = io('http://localhost:8033', {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Chat response handler
    newSocket.on('chat-response', (data) => {
      const { roomId, response } = data;
      const handler = responseHandlers.current.get(roomId);
      if (handler) {
        handler(response);
        responseHandlers.current.delete(roomId);
      }
    });

    // Error handler
    newSocket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred');
      
      // Notify any waiting handlers
      responseHandlers.current.forEach((handler, roomId) => {
        handler({ error: data.message });
        responseHandlers.current.delete(roomId);
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinRoom = useCallback(async (roomId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('join-room', roomId);

      // Listen for room-joined confirmation
      const handleRoomJoined = (data: any) => {
        if (data.roomId === roomId && data.success) {
          socket.off('room-joined', handleRoomJoined);
          resolve();
        }
      };

      socket.on('room-joined', handleRoomJoined);

      // Timeout after 5 seconds
      setTimeout(() => {
        socket.off('room-joined', handleRoomJoined);
        reject(new Error('Room join timeout'));
      }, 5000);
    });
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;
    socket.emit('leave-room', roomId);
  }, [socket, isConnected]);

  const sendChatMessage = useCallback(async (
    messages: any[], 
    roomId: string, 
    mode: 'content' | 'tool' | 'rag' = 'content'
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Set up response handler
      responseHandlers.current.set(roomId, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });

      // Emit the appropriate event based on mode
      const eventMap = {
        content: 'chat-message',
        tool: 'chat-tool-message',
        rag: 'chat-rag-message'
      };

      socket.emit(eventMap[mode], { messages, roomId });

      // Timeout after 60 seconds
      setTimeout(() => {
        if (responseHandlers.current.has(roomId)) {
          responseHandlers.current.delete(roomId);
          reject(new Error('Chat response timeout'));
        }
      }, 60000);
    });
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        error
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};