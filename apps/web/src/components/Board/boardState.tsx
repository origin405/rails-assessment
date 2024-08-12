import { atom, useAtom } from "jotai";
import { trpc } from "@/utils/trpc";
import { useEffect, useRef, useState } from "react";
import { TRPCClientError } from '@trpc/client';

// Define your Board type
type Board = {
  id: string;
  lists: List[];
  actionCounter: number;
  tabId: string;
};

type List = {
  id: string;
  title: string;
  order: number;
  cards: Card[];
};

type Card = {
  id: string;
  content: string;
  order: number;
};

type AddListPayload = {
  boardId: string;
  title: string;
};
type ReorderListPayload = {
  boardId: string;
  sourceIndex: number;
  destinationIndex: number;
};
type AddCardPayload = {
  boardId: string;
  listId: string;
  content: string;
};
type MoveCardPayload = {
  boardId: string;
  sourceListId: string;
  destinationListId: string;
  sourceIndex: number;
  destinationIndex: number;
  cardId: string;
};

type DeleteListPayload = {
  boardId: string;
  listId: string;
};

type UpdateListTitlePayload = {
  boardId: string;
  listId: string;
  newTitle: string;
};
type UpdateCardContentPayload = {
  boardId: string;
  listId: string;
  cardId: string;
  newContent: string;
};

type DeleteCardPayload = {
  boardId: string;
  listId: string;
  cardId: string;
};

// Define your Change type
type Change =
  | { type: "ADD_LIST"; payload: AddListPayload }
  | { type: "REORDER_LIST"; payload: ReorderListPayload }
  | { type: "DELETE_LIST"; payload: DeleteListPayload }
  | { type: "UPDATE_LIST_TITLE"; payload: UpdateListTitlePayload }
  | {
      type: "ADD_CARD";
      payload: AddCardPayload;
    }
  | { type: "DELETE_CARD"; payload: DeleteCardPayload }
  | { type: "UPDATE_CARD_CONTENT"; payload: UpdateCardContentPayload }
  | {
      type: "MOVE_CARD";
      payload: MoveCardPayload;
    };

const boardAtom = atom<Board | null>(null);


export function useBoardState() {
  const [board, setBoard] = useAtom(boardAtom);
  const changeQueueRef = useRef<Change[]>([]);
  const savedStateRef = useRef<Board | null>(null);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const applyChangesMutation = trpc.board.applyChanges.useMutation();
  const [error, setError] = useState<string | null>(null)


  const initializeBoard = (
    boardId: string,
    tabId: string,
    lists: List[],
    actionCounter: number
  ) => {
    setBoard({
      id: boardId,
      tabId: tabId,
      lists: lists,
      actionCounter: actionCounter, 
    });
  };

  const applyChange = (change: Change) => {
    changeQueueRef.current.push(change);
    applyChangeLocally(change);

    if (changeQueueRef.current.length === 1) {
      savedStateRef.current = board;
      scheduleBatch();
    }
  };

  const applyChangeLocally = (change: Change) => {
    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard;
      switch (change.type) {
        case "ADD_LIST":
          const newBoard = {
            ...prevBoard,
            actionCounter: prevBoard.actionCounter + 1, // Increment actionCounter
            lists: [
              ...prevBoard.lists,
              {
                id: `temp-${Date.now()}`, // Temporary ID until server responds
                title: change.payload.title,
                order: prevBoard.lists.length,
                cards: [],
              },
            ],
          };
          return newBoard;
        case "REORDER_LIST": {
          const { sourceIndex, destinationIndex } = change.payload;
          const newLists = Array.from(prevBoard.lists);
          const [reorderedList] = newLists.splice(sourceIndex, 1);
          newLists.splice(destinationIndex, 0, reorderedList);

          const updatedLists = newLists.map((list, index) => ({
            ...list,
            order: index,
          }));

          return {
            ...prevBoard,
            lists: updatedLists,
            actionCounter: prevBoard.actionCounter + 1,
          };
        }
        case "ADD_CARD":
          return {
            ...prevBoard,
            actionCounter: prevBoard.actionCounter + 1,
            lists: prevBoard.lists.map((list) =>
              list.id === change.payload.listId
                ? {
                    ...list,
                    cards: [
                      ...list.cards,
                      {
                        id: `temp-${Date.now()}`,
                        content: change.payload.content,
                        order: list.cards.length,
                      },
                    ],
                  }
                : list
            ),
          };
        case "MOVE_CARD": {
          const {
            sourceListId,
            destinationListId,
            sourceIndex,
            destinationIndex,
            cardId,
          } = change.payload;
          const newLists = prevBoard.lists.map((list) => {
            if (list.id === sourceListId) {
              const newCards = [...list.cards];
              const [movedCard] = newCards.splice(sourceIndex, 1);
              if (sourceListId === destinationListId) {
                newCards.splice(destinationIndex, 0, movedCard);
              }
              return { ...list, cards: newCards };
            }
            if (
              list.id === destinationListId &&
              sourceListId !== destinationListId
            ) {
              const newCards = [...list.cards];
              const movedCard = prevBoard.lists.find(
                (l) => l.id === sourceListId
              )?.cards[sourceIndex];
              if (movedCard) {
                newCards.splice(destinationIndex, 0, movedCard);
              }
              return { ...list, cards: newCards };
            }
            return list;
          });

          return {
            ...prevBoard,
            lists: newLists,
            actionCounter: prevBoard.actionCounter + 1,
          };
        }
        case "DELETE_LIST":
          return {
            ...prevBoard,
            lists: prevBoard.lists.filter(
              (list) => list.id !== change.payload.listId
            ),
            actionCounter: prevBoard.actionCounter + 1,
          };

        case "UPDATE_LIST_TITLE":
          return {
            ...prevBoard,
            lists: prevBoard.lists.map((list) =>
              list.id === change.payload.listId
                ? { ...list, title: change.payload.newTitle }
                : list
            ),
            actionCounter: prevBoard.actionCounter + 1,
          };
        case "UPDATE_CARD_CONTENT":
          return {
            ...prevBoard,
            lists: prevBoard.lists.map((list) =>
              list.id === change.payload.listId
                ? {
                    ...list,
                    cards: list.cards.map((card) =>
                      card.id === change.payload.cardId
                        ? { ...card, content: change.payload.newContent }
                        : card
                    ),
                  }
                : list
            ),
            actionCounter: prevBoard.actionCounter + 1,
          };

        case "DELETE_CARD":
          return {
            ...prevBoard,
            lists: prevBoard.lists.map((list) =>
              list.id === change.payload.listId
                ? {
                    ...list,
                    cards: list.cards.filter(
                      (card) => card.id !== change.payload.cardId
                    ),
                  }
                : list
            ),
            actionCounter: prevBoard.actionCounter + 1,
          };
        // Handle other change types here
        default:
          return prevBoard;
      }
    });
  };
  const scheduleBatch = () => {
    if (batchTimerRef.current === null) {
      batchTimerRef.current = setTimeout(processBatch, 500);
    }
  };

  const processBatch = async () => {
    batchTimerRef.current = null;
    if (changeQueueRef.current.length === 0) return;

    const batchToProcess = [...changeQueueRef.current];
    try {
      const result = await applyChangesMutation.mutateAsync({
        boardId: board?.id ?? "",
        tabId: board?.tabId ?? "",
        changes: batchToProcess,
        currentActionCounter: board?.actionCounter ?? 0,
      });

      if (result.success) {
        // Remove processed changes from the queue
        changeQueueRef.current = changeQueueRef.current.slice(batchToProcess.length);
        savedStateRef.current = null;

        // If there are more changes, schedule another batch
        if (changeQueueRef.current.length > 0) {
          scheduleBatch();
        }
      } else {
        throw new Error("Changes were not applied successfully");
      }
    } catch (error: unknown) {
      console.error("Error in processBatch:", error);

      // Revert to saved state
      if (savedStateRef.current) {
        setBoard(savedStateRef.current);
      }

      // Clear the entire change queue
      changeQueueRef.current = [];

      // Reset the batch timer
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }

      if (isTRPCClientError(error)) {
        if (error.data?.code === 'CONFLICT') {
          handleConflict();
        } else {
          setError(`An error occurred: ${error.message}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      // Do not continue processing after reverting
      return;
    }
  };
  const handleConflict = () => {
    setError('The board has been modified by another user. The page will refresh to show the latest changes.');
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };
  const isTRPCClientError = (error: unknown): error is TRPCClientError<any> => {
    return error instanceof TRPCClientError;
  }
  return { board, applyChange,     error, setError,    initializeBoard };
}