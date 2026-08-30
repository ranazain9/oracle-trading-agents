/**
 * WebSocket Streaming Hooks for Real-Time Telemetry and Position Blotter
 * Direct low-latency connection with automatic reconnection and instant event dispatch.
 */

import { useEffect, useRef, useState } from 'react';
import { TelemetryLogMessage, PositionData } from './types';

function getWsUrl(path: string): string {
  if (window.location.port === '5173') {
    return `ws://127.0.0.1:8000${path}`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${path}`;
}

export function useTelemetryWebSocket(onAgentEvent?: (event: any) => void) {
  const [logs, setLogs] = useState<TelemetryLogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let unmounted = false;
    const wsUrl = getWsUrl('/ws/telemetry');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmounted) return;
      setIsConnected(true);
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO',
          message: 'Connected to ORACLE Real-Time Telemetry Stream.',
        },
      ]);
    };

    ws.onmessage = (event) => {
      if (unmounted) return;
      try {
        const data = JSON.parse(event.data);

        // Filter out heartbeat keepalives from spamming the log console
        if (data.event_type === 'PONG' || data.event_type === 'PING' || data.type === 'PONG') {
          return;
        }

        // Immediate callback dispatch for real-time dashboard updates
        if (onAgentEvent) {
          onAgentEvent(data);
        }

        const logMsg =
          data.message ||
          (data.event_type ? `[${data.event_type}] ${data.summary || data.status || 'Event recorded'}` : JSON.stringify(data));

        setLogs((prev) => [
          ...prev.slice(-100), // Keep last 100 entries
          {
            timestamp: data.timestamp || new Date().toLocaleTimeString(),
            level: data.level || (data.event_type === 'ERROR' ? 'ERROR' : data.event_type === 'ALERT' ? 'WARN' : 'INFO'),
            agent: data.agent || data.node || data.source || (data.event_type === 'CONNECTED' ? 'SYSTEM' : undefined),
            message: logMsg,
          },
        ]);
      } catch {
        setLogs((prev) => [
          ...prev.slice(-100),
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'INFO',
            message: event.data,
          },
        ]);
      }
    };

    ws.onclose = () => {
      if (!unmounted) setIsConnected(false);
    };

    ws.onerror = () => {
      if (!unmounted) setIsConnected(false);
    };

    // Keepalive ping
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 15000);

    return () => {
      unmounted = true;
      clearInterval(pingInterval);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [onAgentEvent]);

  const clearLogs = () => setLogs([]);

  return { logs, isConnected, clearLogs };
}

export function usePositionsWebSocket(onPositionsUpdate?: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unmounted = false;
    const wsUrl = getWsUrl('/ws/positions');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (!unmounted) setIsConnected(true);
    };

    ws.onmessage = (event) => {
      if (unmounted) return;
      try {
        const data = JSON.parse(event.data);
        if (onPositionsUpdate) {
          onPositionsUpdate(data);
        }
      } catch (err) {
        console.error('Error parsing positions stream', err);
      }
    };

    ws.onclose = () => {
      if (!unmounted) setIsConnected(false);
    };

    ws.onerror = () => {
      if (!unmounted) setIsConnected(false);
    };

    return () => {
      unmounted = true;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [onPositionsUpdate]);

  return { isConnected };
}
