import { useEffect, useState, useRef, useCallback } from 'react';

export function useSSE(boardId: string, tabId: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messageCountRef = useRef(0);

  const handleSSEMessage = useCallback((event: MessageEvent) => {
    messageCountRef.current += 1;
    console.log(`SSE message #${messageCountRef.current} received:`, event.data);
    try {
      const newData = JSON.parse(event.data);
      setData(newData);
    } catch (parseError) {
      console.error('Error parsing SSE message:', parseError);
    }
  }, []);

  const connect = useCallback(() => {
    if (!boardId || !tabId) {
      return;
    }
    if (eventSourceRef.current) {
      return;
    }

    const url = `/api/sse?boardId=${boardId}&tabId=${tabId}`;
    console.log('Attempting to connect to SSE:', url);
    
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onopen = () => {
      console.log('SSE connection opened');
      setError(null);
    };

    eventSourceRef.current.onmessage = handleSSEMessage;

    eventSourceRef.current.onerror = (event) => {
      console.error('SSE error:', event);
      setError('Connection lost. Attempting to reconnect...');
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      setTimeout(connect, 5000);
    };
  }, [boardId, tabId, handleSSEMessage]);

  useEffect(() => {
    connect();

    return () => {
      console.log('Closing SSE connection');
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connect]);

  return { data, error };
}