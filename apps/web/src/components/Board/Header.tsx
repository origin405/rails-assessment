import React from 'react';
import { useAtom } from 'jotai';
import { Menu } from 'lucide-react';
import { sidebarOpenAtom } from '@/atoms/boardAtoms';

const Header: React.FC = () => {
  // const [board] = useAtom(boardAtom);
  // const [user] = useAtom(userAtom);
  const [, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="mr-4 text-gray-400 hover:text-gray-100 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          {/* <h1 className="text-2xl font-bold text-gray-100">{board.name}</h1> */}
          <h1 className="text-2xl font-bold text-gray-100">Sup</h1>
        </div>
        <div className="flex items-center">
          {/* <span className="text-gray-100">{user.name}</span> */}
          <span className="text-gray-100">Marv</span>
        </div>
      </div>
    </header>
  );
};

export default Header;