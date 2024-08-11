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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-100">
          Welcome to 
          <span className="block text-8xl mt-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-red-400 to-pink-400 animate-bounce">
            Mini on Rails
          </span>
        </h1>
        <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-orange-500">
          <p className="text-lg text-gray-200 text-center">
            Select a board from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BoardDefaultPage;