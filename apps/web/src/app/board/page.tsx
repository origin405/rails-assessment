"use client"
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { trpc } from '@/utils/trpc';
import Header from '@/components/Board/Header';
import Sidebar from '@/components/Board/Sidebar';
import BoardContent from '@/components/Board/BoardContent';
import {  userAtom, sidebarOpenAtom } from '@/atoms/boardAtoms';
import {  useSession  } from 'next-auth/react';

const Board = () => {
  const { data: session } = useSession();
  const [user, setUser] = useAtom(userAtom);
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  // Fetch board data
  // const boardQuery = trpc.board.getBoard.useQuery({ userId: /* user ID */ });

  // Fetch user data
  // const userQuery = trpc.user.getUser.useQuery({ userId: /* user ID */ });

  //  useEffect(() => {
  //   console.log("data: ", session);
  // });
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      });
      console.log("user:", user);
    }
  }, [session, setUser]);

  if (!session) {
    return <div>Loading...</div>; // Or redirect to login
  }

  // useEffect(() => {
  //   if (boardQuery.data) setBoard(boardQuery.data);
  //   if (userQuery.data) setUser(userQuery.data);
  // }, [boardQuery.data, userQuery.data, setBoard, setUser]);

  // if (boardQuery.isLoading || userQuery.isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (boardQuery.isError || userQuery.isError) {
  //   return <div>Error loading board data</div>;
  // }


    return (
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-orange-900 to-orange-500">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <BoardContent />
         {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-30 transition-opacity "
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
    </div>

    )};

export default Board;