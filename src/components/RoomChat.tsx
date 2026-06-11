// src/components/RoomChat.tsx
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { FiSend } from 'react-icons/fi';

interface RoomChatProps {
  roomId: string;
  token: string;
  currentUserId: number;
}

export const RoomChat: React.FC<RoomChatProps> = ({ roomId, token, currentUserId }) => {
  const { t } = useTranslation('rooms');
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isConnected, error, sendMessage, messagesEndRef } = useChat({
    roomId,
    token,
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[450px] rounded-2xl bg-gradient-to-br from-panel to-panel-dark shadow-lg border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h3 className="text-base font-bold text-white">{t('rooms:chat.title')}</h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">{t('rooms:chat.connected')}</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">{t('rooms:chat.connecting')}</span>
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2 bg-red-500/20 border-b border-red-500 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-app">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.usuario.id_usuario === currentUserId;
            return (
              <div
                key={msg.id_mensaje}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-2 max-w-[70%] ${
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.usuario.foto_perfil ? (
                      <img
                        src={msg.usuario.foto_perfil}
                        alt={msg.usuario.nombre_usuario}
                        className="w-8 h-8 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-semibold text-white">
                        {msg.usuario.nombre_usuario.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="text-xs font-semibold mb-1 text-green-400">
                          {msg.usuario.nombre_usuario}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.contenido}
                      </p>
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        isOwnMessage ? 'text-right' : 'text-left'
                      }`}
                    >
                      {new Date(msg.fecha_envio).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-2 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('rooms:chat.placeholder')}
            className="flex-1 px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
