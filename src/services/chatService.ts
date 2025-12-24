// src/services/chatService.ts
export interface ChatMessage {
  id_mensaje: number;
  contenido: string;
  fecha_envio: string;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    foto_perfil: string | null;
  };
}

export interface ChatServiceCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onHistory?: (messages: ChatMessage[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

class ChatService {
  private socket: WebSocket | null = null;
  private roomId: string | null = null;
  private callbacks: ChatServiceCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(roomId: string, token: string, callbacks: ChatServiceCallbacks) {
    this.roomId = roomId;
    this.callbacks = callbacks;

    const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log(`Conectado al chat de la sala ${roomId}`);
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
          this.callbacks.onMessage?.(data.message);
        } else if (data.type === 'history') {
          this.callbacks.onHistory?.(data.messages);
        } else if (data.type === 'error') {
          this.callbacks.onError?.(data.message);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.callbacks.onError?.('Error de conexión');
    };

    this.socket.onclose = () => {
      console.log('WebSocket desconectado');
      this.callbacks.onDisconnect?.();

      // Intentar reconectar
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.connect(roomId, token, callbacks);
        }, this.reconnectDelay);
      }
    };
  }

  sendMessage(contenido: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        contenido
      }));
    } else {
      console.error('WebSocket no está conectado');
      this.callbacks.onError?.('No conectado al servidor');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.roomId = null;
      this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexión
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const chatService = new ChatService();
