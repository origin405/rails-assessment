import { ReadableStreamDefaultController } from 'node:stream/web';

const clients = new Map<string, Map<string, ReadableStreamDefaultController>>();

export function addClient(boardId: string, tabId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(boardId)) {
    clients.set(boardId, new Map());
  }
  clients.get(boardId)!.set(tabId, controller);
  console.log(`Client connected: boardId=${boardId}, tabId=${tabId}`);
  console.log(`Total clients for board ${boardId}: ${clients.get(boardId)!.size}`);
}

export function removeClient(boardId: string, tabId: string) {
  clients.get(boardId)?.delete(tabId);
  if (clients.get(boardId)?.size === 0) {
    clients.delete(boardId);
  }
  console.log(`Client disconnected: boardId=${boardId}, tabId=${tabId}`);
  console.log(`Remaining clients for board ${boardId}: ${clients.get(boardId)?.size || 0}`);
}

export function sendSSEUpdate(boardId: string, excludeTabId: string, data: any) {
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