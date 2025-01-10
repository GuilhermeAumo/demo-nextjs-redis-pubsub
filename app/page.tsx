"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    console.log("Connecting to SSE...");
    const eventSource = new EventSource('/api/redis');
    console.log("Event Source:", eventSource);

    eventSource.onmessage = (event) => {
      console.log("Received message:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Messages</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}