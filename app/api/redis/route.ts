import { redisSub } from '../../lib/redis'; // Adjust path as needed
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const encoder = new TextEncoder();

  try {
    console.log(">>>>>>>>>>>>>>redis create connection");

    // Headers for SSE
    const headers = new Headers({
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Content-Encoding': 'none',
      'Access-Control-Allow-Origin': '*',
    });

    // Subscribe to the Redis channel
    await redisSub.subscribe('my_channel');
    console.log("Subscribed to Redis channel: my_channel");
    writer.write(encoder.encode('data: Connected to Redis channel: my_channel\n\n'));

    const messageHandler = (channel: string, message: string) => {
      console.log(`>> Message from channel ${channel}: ${message}`);
      writer.write(encoder.encode(`data: ${message}\n\n`)); // Stream message
    };

    redisSub.on('message', messageHandler);

    // Cleanup on client disconnect
    const cleanup = () => {
      console.log("Client disconnected. Cleaning up...");
      redisSub.off('message', messageHandler); // Remove listener
      redisSub.unsubscribe('my_channel'); // Unsubscribe
      writer.close(); // Close stream
    };

    req.signal.addEventListener('abort', cleanup);

    // Return readable stream response
    return new NextResponse(readable, { headers });
  } catch (error) {
    console.error("Error setting up SSE connection:", error);
    writer.close();
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
