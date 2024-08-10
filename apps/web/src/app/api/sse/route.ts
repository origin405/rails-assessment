import { NextRequest, NextResponse } from 'next/server';
import { addClient, removeClient } from '@/utils/sse';

export async function GET(request: NextRequest) {
  const boardId = request.nextUrl.searchParams.get('boardId');
  const tabId = request.nextUrl.searchParams.get('tabId');

  if (!boardId || !tabId) {
    return NextResponse.json({ error: 'Missing boardId or tabId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      addClient(boardId, tabId, controller);

      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

      request.signal.addEventListener('abort', () => {
        removeClient(boardId, tabId);
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}