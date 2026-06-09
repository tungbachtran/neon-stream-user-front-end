import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/config';

class UserChatSocket {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(
      `${API_BASE_URL}/admin-chat`,
      {
        auth: { token },
        withCredentials: true,
      transports: ['websocket'],
      },
    );

    this.socket.on('connect', () =>
      console.log('✅ [User] Chat socket connected'),
    );
    this.socket.on('disconnect', () =>
      console.log('❌ [User] Chat socket disconnected'),
    );

    return this.socket;
  }

  get instance(): Socket | null {
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

// Singleton — dùng 1 instance xuyên suốt app
export const userChatSocket = new UserChatSocket();
