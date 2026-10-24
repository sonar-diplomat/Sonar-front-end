import type {HubConnection,HubConnectionState} from '@microsoft/signalr';

import { SIGNALR_HUB_URL } from '@shared/config';
import { isDemoMode } from '@shared/config/data-source';

import { authManager } from '../auth/auth-manager';

export const connectionStates = {Disconnected:'Disconnected' as HubConnectionState,Connecting:'Connecting' as HubConnectionState,Connected:'Connected' as HubConnectionState,Disconnecting:'Disconnecting' as HubConnectionState,Reconnecting:'Reconnecting' as HubConnectionState};
class SignalRManager {
  private connection: HubConnection | null = null;
  private joinedChats: Set<number> = new Set();
  private isConnecting: boolean = false;
  private localConnected = false;
  private localUnsubscribe: (() => void) | null = null;
  private localListeners = new Map<string, Set<(data: unknown) => void>>();

  private getHubUrl(): string {
    return SIGNALR_HUB_URL;
  }

  private async createConnection(): Promise<HubConnection> {
    const {HubConnectionBuilder,HttpTransportType,LogLevel}=await import('@microsoft/signalr');
    const hubUrl = this.getHubUrl();

    const builder = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          const token = authManager.getAccessToken();
          return token || '';
        },
        // Disable credentials to avoid CORS issues when server uses wildcard origin
        withCredentials: false,
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
    if (isDemoMode) {
      if (!authManager.isAuthenticated() || this.localConnected) return;
      const { subscribeDemoEvents } = await import('@demo-runtime');
      this.localUnsubscribe?.();
      this.localUnsubscribe = subscribeDemoEvents(event => { for (const callback of this.localListeners.get(event.name) ?? []) callback(event.payload); });
      this.localConnected = true;
      return;
    }
    if (this.connection?.state === connectionStates.Connected) {
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

      this.connection = await this.createConnection();
      this.setupEventHandlers();

      await this.connection.start();
      this.isConnecting = false;

      await this.rejoinChats();
    } catch (error) {
      this.isConnecting = false;
      // Only log non-CORS errors to avoid console spam
      const errorMessage = (error as Error)?.message || String(error);
      if (!errorMessage.includes('CORS') && !errorMessage.includes('Failed to fetch')) {
        console.error('[SignalR] Connection error:', error);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (isDemoMode) { this.localUnsubscribe?.(); this.localUnsubscribe = null; this.localConnected = false; this.joinedChats.clear(); return; }
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
    if (isDemoMode) { await this.connect(); this.joinedChats.add(chatId); return; }
    if (!this.connection || this.connection.state !== connectionStates.Connected) {
      await this.connect();
      
      let attempts = 0;
      while (this.connection && this.connection.state !== connectionStates.Connected && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (!this.connection) {
      throw new Error('SignalR connection not available');
    }

    if (this.connection.state !== connectionStates.Connected) {
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
    if (isDemoMode) { this.joinedChats.delete(chatId); return; }
    if (!this.connection || this.connection.state !== connectionStates.Connected) {
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
    if (isDemoMode) { await this.localOperation(`Chat/${chatId}/typing`, 'POST'); return; }
    if (!this.connection || this.connection.state !== connectionStates.Connected) {
      return;
    }

    try {
      await this.connection.invoke('Typing', chatId);
    } catch (error) {
      console.error(`[SignalR] Error sending typing event for chat ${chatId}:`, error);
    }
  }

  async readMessages(chatId: number, messageIds: number[]): Promise<void> {
    if (isDemoMode) { await this.localOperation(`Chat/${chatId}/read`, 'PUT', messageIds); return; }
    if (!this.connection || this.connection.state !== connectionStates.Connected) {
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
    if (isDemoMode) { await this.localOperation(`Chat/${chatId}/read-all`, 'PUT'); return; }
    if (!this.connection || this.connection.state !== connectionStates.Connected) {
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

  private async localOperation(url: string, method: string, body?: unknown): Promise<void> {
    const { dispatchMock } = await import('@demo-dispatcher');
    const result = await dispatchMock({ url, method, body });
    if (!result.success) throw new Error(result.message);
  }

  on<T = unknown>(eventName: string, callback: (data: T) => void): void {
    if (isDemoMode) { if (!this.localListeners.has(eventName)) this.localListeners.set(eventName, new Set()); this.localListeners.get(eventName)!.add(callback as (data: unknown) => void); return; }
    if (!this.connection) {
      console.warn(`[SignalR] Cannot subscribe to ${eventName}: connection not initialized`);
      return;
    }

    this.connection.on(eventName, callback);
  }

  off<T = unknown>(eventName: string, callback?: (data: T) => void): void {
    if (isDemoMode) { if (callback) this.localListeners.get(eventName)?.delete(callback as (data: unknown) => void); else this.localListeners.delete(eventName); return; }
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
    if (isDemoMode) return this.localConnected;
    return this.connection?.state === connectionStates.Connected;
  }

  getConnectionState(): HubConnectionState {
    if (isDemoMode) return this.localConnected ? connectionStates.Connected : connectionStates.Disconnected;
    return this.connection?.state ?? connectionStates.Disconnected;
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
    if (!this.connection || this.connection.state !== connectionStates.Connected) {
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

