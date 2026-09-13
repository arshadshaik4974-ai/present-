/**
 * WebSocket service for real-time AI events.
 * Connects to ws://localhost:8000/ws/ai
 */

const WS_URL = import.meta.env.VITE_WS_URL || 
  (import.meta.env.PROD 
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws` 
    : 'ws://localhost:8000/ws');

type MessageHandler = (data: string) => void;
type StatusHandler = (connected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private shouldReconnect = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseDelay = 1000;

  connect(clientId: string = 'anonymous'): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this.reconnectAttempts = 0;

    const url = `${WS_URL}/ai?client_id=${encodeURIComponent(clientId)}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.notifyStatus(false);
      this.scheduleReconnect(clientId);
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.notifyStatus(true);
    };

    this.ws.onmessage = (event) => {
      this.messageHandlers.forEach((handler) => handler(event.data));
    };

    this.ws.onclose = () => {
      this.notifyStatus(false);
      if (this.shouldReconnect) {
        this.scheduleReconnect(clientId);
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus(false);
  }

  send(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(clientId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect(clientId);
    }, delay);
  }

  private notifyStatus(connected: boolean): void {
    this.statusHandlers.forEach((handler) => handler(connected));
  }
}

export const wsService = new WebSocketService();
