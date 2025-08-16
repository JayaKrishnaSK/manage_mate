'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  moduleId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export default function Chat({ moduleId }: { moduleId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      // Initialize Socket.IO client
      socketRef.current = io();
      
      // Subscribe to the chat channel for this module
      socketRef.current.emit('subscribe', [`chat:${moduleId}`]);
      
      // Listen for chat messages
      socketRef.current.on('chat-message', (data: any) => {
        setMessages(prev => [...prev, data]);
      });
      
      // Fetch initial messages
      fetchMessages();
    }
    
    return () => {
      // Clean up Socket.IO connection
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', [`chat:${moduleId}`]);
        socketRef.current.disconnect();
      }
    };
  }, [session, moduleId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages/${moduleId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId,
          content: newMessage,
        }),
      });
      
      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{message.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm mt-1">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}