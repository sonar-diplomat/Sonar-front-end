import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { authManager } from '../auth/auth-manager';

/**
 * SignalR Manager for managing WebSocket connection with chats
 */
class SignalRManager {
  private connection: HubConnection | null = null;
  private joinedChats: Set<number> = new Set();
  private isConnecting: boolean = false;

  private getHubUrl(): string {
    if (import.meta.env.DEV) {
      return '/hubs/chat';
    }
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7124/api/';
    return `${apiBaseUrl}/hubs/chat`;
  }

  private createConnection(): HubConnection {
    const hubUrl = this.getHubUrl();

    const builder = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          const token = authManager.getAccessToken();
          return token || '';
        },
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 3) {
            return 1000;
          }
          if (retryContext.previousRetryCount < 5) {
            return 5000;
          }
          return 10000;
        },
      });

    if (import.meta.env.DEV) {
      builder.configureLogging(LogLevel.Information);
    }

    return builder.build();
  }

  async connect(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    if (!authManager.isAuthenticated()) {
      return;
    }

    this.isConnecting = true;

    try {
      if (this.connection) {
        await this.connection.stop();
      }

      this.connection = this.createConnection();
      this.setupEventHandlers();

      await this.connection.start();
      this.isConnecting = false;

      await this.rejoinChats();
    } catch (error) {
      this.isConnecting = false;
      console.error('[SignalR] Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        for (const chatId of this.joinedChats) {
          try {
            await this.leaveChat(chatId);
          } catch (error) {
            console.error(`[SignalR] Error leaving chat ${chatId}:`, error);
          }
        }
        this.joinedChats.clear();

        await this.connection.stop();
      } catch (error) {
        console.error('[SignalR] Error disconnecting:', error);
      } finally {
        this.connection = null;
      }
    }
  }

  async joinChat(chatId: number): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      await this.connect();
      
      let attempts = 0;
      while (this.connection && this.connection.state !== HubConnectionState.Connected && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (!this.connection) {
      throw new Error('SignalR connection not available');
    }

    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error(`SignalR connection is not in Connected state. Current state: ${this.connection.state}`);
    }

    if (this.joinedChats.has(chatId)) {
      return;
    }

    try {
      await this.connection.invoke('JoinChat', chatId);
      this.joinedChats.add(chatId);
    } catch (error) {
      console.error(`[SignalR] Error joining chat ${chatId}:`, error);
      throw error;
    }
  }

  async leaveChat(chatId: number): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    if (!this.joinedChats.has(chatId)) {
      return;
    }

    try {
      await this.connection.invoke('LeaveChat', chatId);
      this.joinedChats.delete(chatId);
    } catch (error) {
      console.error(`[SignalR] Error leaving chat ${chatId}:`, error);
      this.joinedChats.delete(chatId);
    }
  }

  async sendTyping(chatId: number): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('Typing', chatId);
    } catch (error) {
      console.error(`[SignalR] Error sending typing event for chat ${chatId}:`, error);
    }
  }

  async readMessages(chatId: number, messageIds: number[]): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection not available');
    }

    // Ensure chat is joined before calling read methods
    if (!this.joinedChats.has(chatId)) {
      await this.joinChat(chatId);
    }

    try {
      await this.connection.invoke('ReadMessages', chatId, messageIds);
    } catch (error) {
      console.error(`[SignalR] Error reading messages for chat ${chatId}:`, error);
      throw error;
    }
  }

  async readAllMessages(chatId: number): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection not available');
    }

    // Ensure chat is joined before calling read methods
    if (!this.joinedChats.has(chatId)) {
      if (import.meta.env.DEV) {
        console.log(`[SignalR] Chat ${chatId} not joined, joining now...`);
      }
      await this.joinChat(chatId);
      // Small delay to ensure server-side group assignment is complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      if (import.meta.env.DEV) {
        console.log(`[SignalR] Invoking ReadAllMessages for chat ${chatId}...`);
      }
      await this.connection.invoke('ReadAllMessages', chatId);
      if (import.meta.env.DEV) {
        console.log(`[SignalR] Successfully invoked ReadAllMessages for chat ${chatId}`);
      }
    } catch (error) {
      console.error(`[SignalR] Error reading all messages for chat ${chatId}:`, error);
      if (import.meta.env.DEV) {
        console.error(`[SignalR] Error details:`, {
          chatId,
          isJoined: this.joinedChats.has(chatId),
          connectionState: this.connection?.state,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }

  on<T = any>(eventName: string, callback: (data: T) => void): void {
    if (!this.connection) {
      console.warn(`[SignalR] Cannot subscribe to ${eventName}: connection not initialized`);
      return;
    }

    this.connection.on(eventName, callback);
  }

  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.connection) {
      return;
    }

    if (callback) {
      this.connection.off(eventName, callback);
    } else {
      this.connection.off(eventName);
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  getConnectionState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.onreconnecting(() => {
      // Reconnecting...
    });

    this.connection.onreconnected(async () => {
      await this.rejoinChats();
    });

    this.connection.onclose((error) => {
      this.isConnecting = false;
      if (error) {
        console.error('[SignalR] Connection closed with error:', error);
      }
    });
  }

  private async rejoinChats(): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    const chatsToRejoin = Array.from(this.joinedChats);
    for (const chatId of chatsToRejoin) {
      try {
        await this.connection.invoke('JoinChat', chatId);
      } catch (error) {
        console.error(`[SignalR] Error rejoining chat ${chatId}:`, error);
        this.joinedChats.delete(chatId);
      }
    }
  }
}

export const signalRManager = new SignalRManager();

