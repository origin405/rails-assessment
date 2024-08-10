// app/board/page.tsx
"use client"
import React from 'react';
import { useSession } from 'next-auth/react';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/boardAtoms';

const BoardDefaultPage = () => {
  const { data: session } = useSession();
  const [, setUser] = useAtom(userAtom);

  // Similar useEffect as in your [boardId]/page.tsx to set user data

  if (!session) {
    return <div>Loading...</div>; // Or redirect to login
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Boards</h1>
      {/* Add content here. For example: */}
      <p>Select a board from the sidebar or create a new one to get started.</p>
      {/* You could add a list of boards here if the user has any */}
      {/* Or add a button to create a new board */}
    </div>
  );
}

export default BoardDefaultPage;