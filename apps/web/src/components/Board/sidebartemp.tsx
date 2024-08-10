"use client"
import React, { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { X, ChevronRight, Plus } from 'lucide-react';
import { sidebarOpenAtom, userAtom, selectedBoardNameAtom } from '@/atoms/boardAtoms';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/navigation';
type Board = {
  id: string;
  name: string;
  actionCounter: number;
  createdAt: string;
  updatedAt: string;
};


const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [selectedBoardName, setSelectedBoardName] = useAtom(selectedBoardNameAtom);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const router = useRouter();

  const renderCount = useRef(0);
  renderCount.current += 1;

  console.log(`Sidebar rendering #${renderCount.current}`);
  console.log('sidebarOpen:', sidebarOpen);



  const boardsQuery = trpc.board.listBoards.useQuery();
  const addBoardMutation = trpc.board.addBoard.useMutation({
    onSuccess: () => {
      boardsQuery.refetch();
    },
  });


  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      try {
        const newBoard = await addBoardMutation.mutateAsync({ name: newBoardName.trim() });
        setSelectedBoardName(newBoard.name);
        setNewBoardName('');
        setIsCreatingBoard(false);
        router.push(`/board/${newBoard.id}`);

      } catch (error) {
        console.error('Failed to create board:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  const handleBoardSelect = (board: Board) => {
   
    setSelectedBoardName(board.name);    
    router.push(`/board/${board.id}`);
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-100">My Boards</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-100">
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
              <Plus size={20} className="mr-2" />
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
                    setNewBoardName('');
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
              <a
                key={board.id}
                onClick={() => handleBoardSelect(board)}
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {board.name}
              </a>
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