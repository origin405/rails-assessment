"use client"
import React, {useEffect} from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/boardAtoms';

const BoardDefaultPage = () => {
  const session = useRequireAuth();
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    if (session?.user) {
      console.log("setting user")
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session, setUser]);

  // Similar useEffect as in your [boardId]/page.tsx to set user data

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-900 to-orange-500">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-orange-900 to-orange-500">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-textcolor text-center">
          Welcome to
          <span className="block text-5xl sm:text-6xl md:text-6xl lg:text-8xl xl:text-8xl mt-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-red-400 to-pink-400 animate-bounce">
            Trello on Rails
          </span>
        </h1>
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-orange-300 transition-all duration-300 hover:shadow-orange-400/50">
          <div className="flex items-center justify-center ">
            <p className="text-xl text-gray-100 text-center font-light">
              Select a board from the sidebar or create a new one to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardDefaultPage;