/**
 * ORACLE Trading Terminal - Real-Time WebSocket Manager
 * Manages /ws/telemetry and /ws/positions with automatic reconnection.
 */

class WebSocketClient {
    constructor() {
        this.telemetrySocket = null;
        this.positionsSocket = null;
        this.reconnectInterval = 3000;
        this.listeners = {
            telemetry: [],
            positions: []
        };
    }

    init() {
        this.connectTelemetry();
        this.connectPositions();
    }

    connectTelemetry() {
        const wsUrl = "ws://localhost:8000/ws/telemetry";
        this.telemetrySocket = new WebSocket(wsUrl);

        this.telemetrySocket.onopen = () => {
            console.log("🟢 WS Connected: /ws/telemetry");
            const badge = document.getElementById("ws-status-text");
            if (badge) badge.innerText = "WS TELEMETRY: CONNECTED";
            const dot = document.querySelector("#ws-status-badge .pulse-dot");
            if (dot) dot.className = "pulse-dot cyan";
        };

        this.telemetrySocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.telemetry.forEach(callback => callback(data));
            } catch (e) {
                console.warn("Telemetry WS parse error:", e);
            }
        };

        this.telemetrySocket.onclose = () => {
            console.warn("🔴 WS Disconnected: /ws/telemetry. Reconnecting in 3s...");
            const badge = document.getElementById("ws-status-text");
            if (badge) badge.innerText = "WS TELEMETRY: RECONNECTING";
            const dot = document.querySelector("#ws-status-badge .pulse-dot");
            if (dot) dot.className = "pulse-dot amber";
            setTimeout(() => this.connectTelemetry(), this.reconnectInterval);
        };

        this.telemetrySocket.onerror = (err) => {
            console.error("Telemetry WS Error:", err);
            this.telemetrySocket.close();
        };
    }

    connectPositions() {
        const wsUrl = "ws://localhost:8000/ws/positions";
        this.positionsSocket = new WebSocket(wsUrl);

        this.positionsSocket.onopen = () => {
            console.log("🟢 WS Connected: /ws/positions");
        };

        this.positionsSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.positions.forEach(callback => callback(data));
            } catch (e) {
                console.warn("Positions WS parse error:", e);
            }
        };

        this.positionsSocket.onclose = () => {
            setTimeout(() => this.connectPositions(), this.reconnectInterval);
        };
    }

    onTelemetry(callback) {
        this.listeners.telemetry.push(callback);
    }

    onPositions(callback) {
        this.listeners.positions.push(callback);
    }
}

window.wsClient = new WebSocketClient();
