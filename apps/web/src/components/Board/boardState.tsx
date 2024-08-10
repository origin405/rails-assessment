import { atom, useAtom } from "jotai";
import { trpc } from "@/utils/trpc";
import { useEffect, useRef, useState } from "react";

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
const changeQueueAtom = atom<Change[]>([]);
const savedStateAtom = atom<Board | null>(null);

// let batchTimer: NodeJS.Timeout | null = null;

export function useBoardState() {
  const [board, setBoard] = useAtom(boardAtom);
  const [changeQueue, setChangeQueue] = useAtom(changeQueueAtom);
  const [savedState, setSavedState] = useAtom(savedStateAtom);
  const applyChangesMutation = trpc.board.applyChanges.useMutation();
  const changeQueueRef = useRef(changeQueue);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    changeQueueRef.current = changeQueue;
  }, [changeQueue]);



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
      actionCounter: actionCounter, // You might want to fetch this from the server if needed
    });
  };

  const applyChange = (change: Change) => {
    setChangeQueue((prev) => {
      const newQueue = [...prev, change];
      if (newQueue.length === 1) {
        setSavedState(board);
        scheduleBatch();
      }
      return newQueue;
    });
    applyChangeLocally(change);
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
    const currentQueue = changeQueueRef.current;
    if (currentQueue.length === 0) return;

    const batchToProcess = [...currentQueue];
    setChangeQueue([]);

    try {
      const result = await applyChangesMutation.mutateAsync({
        boardId: board?.id ?? "",
        tabId: board?.tabId ?? "", 
        changes: batchToProcess,
        currentActionCounter: board?.actionCounter ?? 0,
      });
      if (result.success) {
        setSavedState(null);
      } else {
        if (savedState) {
          setBoard(savedState);
          // Notify user about the conflict
        }
      }
    } catch (error) {
      console.error("Error processing batch:", error);
      // Notify user about the error
    }
  };

  return { board, applyChange, initializeBoard };
}