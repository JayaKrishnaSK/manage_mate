import { Server as NetServer } from 'http';
import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type SocketIOServerType = SocketIOServer | null;

// Extend the global NodeJS namespace to add our socket.io server
declare global {
  namespace NodeJS {
    interface Global {
      io: SocketIOServerType;
    }
  }
}

// Extend the Next.js HTTP server to add our socket.io server
export type NextServerWithIO = NetServer & {
  io: SocketIOServerType;
};

export const initSocketIO = (req: NextRequest, server: NetServer): SocketIOServer => {
  if (!global.io) {
    // Create a new Socket.IO server
    const io = new SocketIOServer(server, {
      path: '/api/socketio',
      // @ts-ignore
      addTrailingSlash: false,
    });
    
    // Add the io instance to the global object
    global.io = io;
    
    // Add the io instance to the server object
    (server as NextServerWithIO).io = io;
    
    // Add authentication middleware
    io.use(async (socket, next) => {
      try {
        const session = await getServerSession(authOptions);
        if (session) {
          socket.data.userId = session.user.id;
          next();
        } else {
          next(new Error('Authentication error'));
        }
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
    
    // Handle connection events
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.userId}`);
      
      // Join a room for the user
      socket.join(`user:${socket.data.userId}`);
      
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.userId}`);
      });
    });
  }
  
  return global.io;
};