// components/Sidebar.tsx
"use client";
import React, { useState, useRef } from "react";
import { useAtom } from "jotai";
import { X, ChevronRight, Plus, Trash, Edit, Check, XCircle } from "lucide-react";

import {
  sidebarOpenAtom,
  userAtom,
  selectedBoardNameAtom,
} from "@/atoms/boardAtoms";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";

type Board = {
  id: string;
  name: string;
  actionCounter: number;
  createdAt: string;
  updatedAt: string;
};

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [selectedBoardName, setSelectedBoardName] = useAtom(
    selectedBoardNameAtom
  );
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = useState("");
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const router = useRouter();

  const boardsQuery = trpc.board.listBoards.useQuery();
  const addBoardMutation = trpc.board.addBoard.useMutation({
    onSuccess: () => {
      boardsQuery.refetch();
    },
  });
  const updateBoardMutation = trpc.board.updateBoard.useMutation({
    onSuccess: () => {
      boardsQuery.refetch();
    },
  });
  const deleteBoardMutation = trpc.board.deleteBoard.useMutation({
    onSuccess: () => {
      boardsQuery.refetch();
    },
  });

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      try {
        const newBoard = await addBoardMutation.mutateAsync({
          name: newBoardName.trim(),
        });
        setSelectedBoardName(newBoard.name);
        setNewBoardName("");
        setIsCreatingBoard(false);
        router.push(`/board/${newBoard.id}`);
      } catch (error) {
        console.error("Failed to create board:", error);
      }
    }
  };

  const handleBoardSelect = (board: Board) => {
    setSelectedBoardName(board.name);
    router.push(`/board/${board.id}`);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoardId(board.id);
    setEditingBoardName(board.name);
  };

  const handleUpdateBoard = async () => {
    if (editingBoardId && editingBoardName.trim()) {
      let updatedBoardName = editingBoardName.trim();
      try {
        await updateBoardMutation.mutateAsync({
          id: editingBoardId,
          name: updatedBoardName,
        });
        setEditingBoardId(null);
        setEditingBoardName("");
        setSelectedBoardName(updatedBoardName);
      } catch (error) {
        console.error("Failed to update board:", error);
      }
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await deleteBoardMutation.mutateAsync({ id: boardId });
      setDeletingBoardId(null);
      if (
        selectedBoardName ===
        boardsQuery.data?.find((b) => b.id === boardId)?.name
      ) {
        setSelectedBoardName("");
        router.push("/board");
      }
    } catch (error) {
      console.error("Failed to delete board:", error);
    }
  };

  const cancelDelete = () => {
    setDeletingBoardId(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-zinc-900 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-black">
          <h2 className="text-xl font-semibold text-gray-100">My Boards</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Create New Board Button */}
        <div className="px-4 py-2">
          {!isCreatingBoard ? (
            <button
              onClick={() => setIsCreatingBoard(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Board
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name"
                className="w-full px-3 py-2 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <div className="flex justify-between">
                <button
                  onClick={handleCreateBoard}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {boardsQuery.isLoading ? (
            <div className="flex justify-center items-center p-4">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : boardsQuery.isError ? (
            <div className="text-red-400">Error loading boards</div>
          ) : (
            boardsQuery.data?.map((board: Board) => (
              <div
                key={board.id}
                className="group relative flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {editingBoardId === board.id ? (
                  <input
                    type="text"
                    value={editingBoardName}
                    onChange={(e) => setEditingBoardName(e.target.value)}
                    onBlur={handleUpdateBoard}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateBoard()}
                    className="flex-grow bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      onClick={() => handleBoardSelect(board)}
                      className="flex-grow cursor-pointer"
                    >
                      {board.name}
                    </span>
                    <div className="hidden group-hover:flex items-center space-x-2">
  {deletingBoardId === board.id ? (
    <>
      <button
        onClick={() => handleDeleteBoard(board.id)}
        className="text-green-500 hover:text-green-400"
        title="Confirm Delete"
      >
        <Check size={20} />
      </button>
      <button
        onClick={cancelDelete}
        className="text-red-500 hover:text-red-400"
        title="Cancel Delete"
      >
        <XCircle size={20} />
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => handleEditBoard(board)}
        className="text-blue-500 hover:text-blue-400"
        title="Edit Board"
      >
        <Edit size={20} />
      </button>
      <button
        onClick={() => setDeletingBoardId(board.id)}
        className="text-red-500 hover:text-red-400"
        title="Delete Board"
      >
        <Trash size={20} />
      </button>
    </>
  )}
</div>
                  </>
                )}
              </div>
            ))
          )}
        </nav>
      </div>

      {/* Sidebar toggle for larger screens */}
      <div className="hidden lg:block fixed left-0 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gray-900 text-gray-400 hover:text-gray-100 p-2 rounded-r-md focus:outline-none"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
