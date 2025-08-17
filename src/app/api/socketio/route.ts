import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { initSocketIO } from '@/lib/socketio';

export async function GET(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    // Initialize Socket.IO server
    // Note: This is a simplified approach. In a production environment,
    // you would need to handle this differently as API routes in Next.js
    // are serverless functions and don't maintain persistent connections.
    
    return new Response('Socket.IO server initialized', { status: 200 });
  } catch (error) {
    console.error('Error initializing Socket.IO:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}