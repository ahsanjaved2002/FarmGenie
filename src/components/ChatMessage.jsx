import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`${
          isUser 
            ? 'bg-blue-500 text-white' 
            : isError 
            ? 'bg-red-100 text-red-800 border-red-200' 
            : 'bg-white text-gray-800 border-gray-200'
        }`}>
          <CardContent className="p-3">
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs opacity-75 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
