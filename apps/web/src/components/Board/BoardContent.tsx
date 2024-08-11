import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
} from "react-beautiful-dnd";
import { trpc } from "@/utils/trpc";
import { selectedBoardNameAtom } from "@/atoms/boardAtoms";
import { useBoardState } from "./boardState";
import { useParams } from "next/navigation";
import List from "@/components/UI/List";
import { useSSE } from "@/hooks/useSSE";
import { v4 as uuidv4 } from "uuid";
import LoadingSpinner from "@/components/UI/Loading";
import toast, { Toaster } from 'react-hot-toast';


const BoardContent: React.FC = () => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const { board, applyChange, error, setError, initializeBoard } = useBoardState();
  const [,setSelectedBoardName] = useAtom(selectedBoardNameAtom);
  const params = useParams();
  const boardId = params.boardId as string;
  const [tabId] = useState(() => uuidv4());

  useEffect(() => {
    console.log("error triggered")
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const {
    data: boardData,
    isLoading: isBoardLoading,
    error: boardError,
    refetch: refetchBoard,
  } = trpc.board.getBoard.useQuery({ boardId }, { enabled: !!boardId });

  const {
    data: lists,
    isLoading: isListsLoading,
    error: listsError,
    refetch: refetchLists,
  } = trpc.board.getLists.useQuery({ boardId }, { enabled: !!boardId });

  useEffect(() => {
    if (boardData && lists && !isBoardLoading && !isListsLoading) {
      // Both queries have completed and data is available
      setSelectedBoardName(boardData.name)
      initializeBoard(boardId, tabId, lists, boardData.actionCounter);
    }
  }, [boardData, lists, isBoardLoading, isListsLoading]);

 

  const refetchBoardData = () => {
    refetchBoard(), refetchLists();
  };


  const sseData = useSSE(boardId, tabId);

  useEffect(() => {
    if (sseData && sseData.data && sseData.data.type === "BOARD_UPDATED") {
      refetchBoardData();
    }
  }, [sseData]);



  const handleAddList = () => {
    if (newListTitle.trim() && board) {
      applyChange({
        type: "ADD_LIST",
        payload: {
          boardId: board.id,
          title: newListTitle.trim(),
        },
      });
      setNewListTitle("");
      setIsAddingList(false);
    }
  };

  const handleAddCard = (listId: string, content: string) => {
    if (board) {
      applyChange({
        type: "ADD_CARD",
        payload: {
          boardId: board.id,
          listId,
          content,
        },
      });
    }
  };

  const handleDeleteList = (listId: string) => {
    if (board) {
      applyChange({
        type: "DELETE_LIST",
        payload: {
          boardId: board.id,
          listId,
        },
      });
    }
  };

  const handleUpdateListTitle = (listId: string, newTitle: string) => {
    if (board) {
      applyChange({
        type: "UPDATE_LIST_TITLE",
        payload: {
          boardId: board.id,
          listId,
          newTitle,
        },
      });
    }
  };

  const handleUpdateCardContent = (
    listId: string,
    cardId: string,
    newContent: string
  ) => {
    if (board) {
      applyChange({
        type: "UPDATE_CARD_CONTENT",
        payload: {
          boardId: board.id,
          listId,
          cardId,
          newContent,
        },
      });
    }
  };

  const handleDeleteCard = (listId: string, cardId: string) => {
    if (board) {
      applyChange({
        type: "DELETE_CARD",
        payload: {
          boardId: board.id,
          listId,
          cardId,
        },
      });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "LIST") {
      applyChange({
        type: "REORDER_LIST",
        payload: {
          boardId: board!.id,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        },
      });
    } else if (type === "CARD") {
      applyChange({
        type: "MOVE_CARD",
        payload: {
          boardId: board!.id,
          sourceListId: source.droppableId,
          destinationListId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
          cardId: draggableId,
        },
      });
    }
  };

  if (isBoardLoading || isListsLoading) {
    return <div className="w-full h-full flex items-center justify-center">
     <LoadingSpinner/>
    </div>;
  }

  if (boardError || listsError) {
    return <div>Error: {boardError?.message || listsError?.message}</div>;
  }

  if (!board || !board) {
    return <div>No board selected</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Toaster />
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-gradient-to-br from-orange-900 to-orange-500">
        <div className="h-full px-4 py-8 flex items-start space-x-4">
          <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
            {(provided: DroppableProvided) => {
              return (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex space-x-4"
                >
                  {board.lists?.map((list, index) => {
                    return (
                      <Draggable
                        key={list.id}
                        draggableId={String(list.id)}
                        index={index}
                      >
                        {(provided: DraggableProvided) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <List
                                id={list.id}
                                title={list.title}
                                cards={list.cards}
                                onDeleteList={handleDeleteList}
                                onAddCard={handleAddCard}
                                onUpdateListTitle={handleUpdateListTitle}
                                onUpdateCard={(cardId, newContent) =>
                                  handleUpdateCardContent(
                                    list.id,
                                    cardId,
                                    newContent
                                  )
                                }
                                onDeleteCard={(cardId) =>
                                  handleDeleteCard(list.id, cardId)
                                }
                              />
                            </div>
                          );
                        }}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
          <div className="flex-shrink-0 w-72">
            {!isAddingList ? (
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded"
                onClick={() => setIsAddingList(true)}
              >
                + Add another list
              </button>
            ) : (
              <div className="bg-gray-800 p-2 rounded">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="w-full p-2 mb-2 rounded border bg-gray-700 text-gray-100 border-gray-600 focus:outline-none focus:border-orange-500"
                />
                <div className="flex justify-between">
                  <button
                    onClick={handleAddList}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-3 rounded"
                  >
                    Add List
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListTitle("");
                    }}
                    className="text-gray-400 hover:text-gray-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </DragDropContext>
  );
};

export default BoardContent;
