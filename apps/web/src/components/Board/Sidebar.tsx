// components/Sidebar.tsx
import React from 'react';
import { useAtom } from 'jotai';
import { X, ChevronRight } from 'lucide-react';
import { sidebarOpenAtom, userAtom } from '@/atoms/boardAtoms';

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [user] = useAtom(userAtom);

  // Placeholder data - replace with actual data from your API
  const boards = ["Board 1", "Board 2", "Board 3"];
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
        <nav className="mt-5 px-2 space-y-1">
          {boards.map((board, index) => (
            <a
              key={index}
              href="#"
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {board}
            </a>
          ))}
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