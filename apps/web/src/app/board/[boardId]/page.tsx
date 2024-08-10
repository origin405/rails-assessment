"use client"
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import BoardContent from '@/components/Board/BoardContent';
import { userAtom } from '@/atoms/boardAtoms';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import LoadingSpinner from "@/components/UI/Loading";

const Board = () => {
  const session = useRequireAuth();
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session, setUser]);

  // If session is null, useRequireAuth is handling the redirect
  if (!session) {
    return <LoadingSpinner/>; 
  }

  return <BoardContent />;
}

export default Board;