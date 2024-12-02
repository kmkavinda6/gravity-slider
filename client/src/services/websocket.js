// client/src/services/websocket.js
export class WebSocketService {
    constructor() {
        this.ws = null;
        this.callbacks = new Set();
        this.reconnectTimeout = null;
        // Update WebSocket URL to use the same port as the Express server
        this.url = 'ws://localhost:3001';
    }

    connect() {
        try {
            console.log('Attempting to connect to WebSocket server...');
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket connected successfully');
                if (this.reconnectTimeout) {
                    clearTimeout(this.reconnectTimeout);
                    this.reconnectTimeout = null;
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data);
                    this.callbacks.forEach(callback => callback(data));
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected, attempting to reconnect...');
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (!this.reconnectTimeout) {
            this.reconnectTimeout = setTimeout(() => {
                console.log('Attempting to reconnect...');
                this.connect();
            }, 3000);
        }
    }

    subscribe(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    sendGravity(value) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: 'gravity', value });
            console.log('Sending gravity update:', message);
            this.ws.send(message);
        } else {
            console.warn('WebSocket is not connected. Cannot send gravity update.');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
}

export const wsService = new WebSocketService();