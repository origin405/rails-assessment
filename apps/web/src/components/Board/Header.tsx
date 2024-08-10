import React, { useState } from "react";
import { useAtom } from "jotai";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  userAtom,
  sidebarOpenAtom,
  selectedBoardNameAtom,
} from "@/atoms/boardAtoms";

const Header = () => {
  const [, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [user] = useAtom(userAtom);
  const [selectedBoardName] = useAtom(selectedBoardNameAtom);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="bg-zinc-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-zinc-500 rounded-md p-2 transition duration-150 ease-in-out"
          >
            <Menu size={24} />
          </button>
          {selectedBoardName ? (
            <h1 className="text-2xl font-bold text-zinc-100">
              {selectedBoardName}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-zinc-400">Select a Board</h1>
          )}
        </div>
        <div className="flex items-center space-x-4 relative">
          {user?.name ? (
            <span className="text-zinc-100">{user.name}</span>
          ) : (
            <span className="text-red-500">?</span>
          )}
          <button 
            className="bg-zinc-700 text-zinc-100 px-3 py-2 rounded-md hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-zinc-500 transition duration-150 ease-in-out flex items-center"
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
          >
            <span>Account</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
          {isAccountMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md overflow-hidden shadow-xl z-10 top-full">
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-700 w-full text-left"
              >
                <LogOut size={16} className="inline mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;