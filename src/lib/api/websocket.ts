import {
  API_CONFIG,
  WSMessage,
  WSMessageType,
  WSSubscription,
  Transaction,
  Stats,
} from './types';

/**
 * Event handlers for WebSocket
 */
export interface WebSocketHandlers {
  onNewTransaction?: (tx: Transaction) => void;
  onTransactionUpdate?: (tx: Transaction) => void;
  onStatsUpdate?: (stats: Stats) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onReconnect?: (attempt: number) => void;
}

/**
 * WebSocket Client for real-time updates
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private handlers: WebSocketHandlers = {};
  private subscriptions: Set<string> = new Set();
  private isManualClose: boolean = false;

  constructor(handlers?: WebSocketHandlers) {
    this.url = API_CONFIG.wsURL;
    this.maxReconnectAttempts = API_CONFIG.ws.maxReconnectAttempts;
    this.reconnectInterval = API_CONFIG.ws.reconnectInterval;
    this.heartbeatInterval = API_CONFIG.ws.heartbeatInterval;

    if (handlers) {
      this.handlers = handlers;
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.warn('WebSocket connection in progress');
      return;
    }

    this.isManualClose = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to channel
   */
  subscribe(subscription: WSSubscription): void {
    const key = JSON.stringify(subscription);

    if (this.subscriptions.has(key)) {
      return;
    }

    this.subscriptions.add(key);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: WSMessageType.SUBSCRIBE,
        data: subscription,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(subscription: WSSubscription): void {
    const key = JSON.stringify(subscription);
    this.subscriptions.delete(key);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: WSMessageType.UNSUBSCRIBE,
        data: subscription,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Send message to server
   */
  private send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  /**
   * Handle WebSocket open
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.startHeartbeat();

    // Resubscribe to all channels
    this.subscriptions.forEach((key) => {
      const subscription = JSON.parse(key);
      this.send({
        type: WSMessageType.SUBSCRIBE,
        data: subscription,
        timestamp: Date.now(),
      });
    });

    this.handlers.onConnect?.();
  }

  /**
   * Handle WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);

      switch (message.type) {
        case WSMessageType.NEW_TRANSACTION:
          this.handlers.onNewTransaction?.(message.data);
          break;

        case WSMessageType.TRANSACTION_UPDATE:
          this.handlers.onTransactionUpdate?.(message.data);
          break;

        case WSMessageType.STATS_UPDATE:
          this.handlers.onStatsUpdate?.(message.data);
          break;

        case WSMessageType.PONG:
          // Heartbeat response
          break;

        case WSMessageType.ERROR:
          console.error('WebSocket error message:', message.data);
          this.handlers.onError?.(new Error(message.data));
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.handlers.onError?.(new Error('WebSocket error'));
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(): void {
    console.log('WebSocket disconnected');
    this.stopHeartbeat();
    this.handlers.onDisconnect?.();

    // Reconnect if not manual close
    if (!this.isManualClose) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnect attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.handlers.onError?.(
        new Error('Failed to reconnect to WebSocket')
      );
      return;
    }

    this.reconnectAttempts++;
    this.handlers.onReconnect?.(this.reconnectAttempts);

    console.log(
      `Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Start heartbeat (ping/pong)
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: WSMessageType.PING,
          timestamp: Date.now(),
        });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Update handlers
   */
  setHandlers(handlers: WebSocketHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Get connection state
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance (optional, can create multiple)
let wsClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(
  handlers?: WebSocketHandlers
): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient(handlers);
  } else if (handlers) {
    wsClientInstance.setHandlers(handlers);
  }
  return wsClientInstance;
}

export function disconnectWebSocket(): void {
  if (wsClientInstance) {
    wsClientInstance.disconnect();
    wsClientInstance = null;
  }
}
