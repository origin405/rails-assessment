import { NextRequest, NextResponse } from 'next/server';

const clients = new Map<string, Map<string, ReadableStreamDefaultController>>();

export async function GET(request: NextRequest) {
  const boardId = request.nextUrl.searchParams.get('boardId');
  const tabId = request.nextUrl.searchParams.get('tabId');

  if (!boardId || !tabId) {
    return NextResponse.json({ error: 'Missing boardId or tabId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      if (!clients.has(boardId)) {
        clients.set(boardId, new Map());
      }
      clients.get(boardId)!.set(tabId, controller);

      console.log(`Client connected: boardId=${boardId}, tabId=${tabId}`);
      console.log(`Total clients for board ${boardId}: ${clients.get(boardId)!.size}`);

      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

      request.signal.addEventListener('abort', () => {
        clients.get(boardId)?.delete(tabId);
        if (clients.get(boardId)?.size === 0) {
          clients.delete(boardId);
        }
        console.log(`Client disconnected: boardId=${boardId}, tabId=${tabId}`);
        console.log(`Remaining clients for board ${boardId}: ${clients.get(boardId)?.size || 0}`);
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

// Helper function to send updates (not exported)
function sendSSEUpdate(boardId: string, excludeTabId: string, data: any) {
  console.log(`Sending update for board ${boardId}, excluding tab ${excludeTabId}`);
  console.log(`Update data:`, JSON.stringify(data));
  
  const boardClients = clients.get(boardId);
  if (boardClients) {
    let updatesSent = 0;
    boardClients.forEach((controller, tabId) => {
      if (tabId !== excludeTabId) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
        console.log(`Update sent to tab ${tabId}`);
        updatesSent++;
      }
    });
    console.log(`Total updates sent for board ${boardId}: ${updatesSent}`);
  } else {
    console.log(`No clients found for board ${boardId}`);
  }
}

// If you need to access clients or sendSSEUpdate from other files, export them like this:
export { clients, sendSSEUpdate as updateSSE };