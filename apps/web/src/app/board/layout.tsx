// app/board/layout.tsx
"use client"
import { type ReactNode } from 'react';
import Header from '@/components/Board/Header';
import Sidebar from '@/components/Board/Sidebar';
import { useAtom } from 'jotai';
import { sidebarOpenAtom } from '@/atoms/boardAtoms';

export default function BoardLayout( {children}: { children: ReactNode } ) {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-orange-900 to-orange-500">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {children}
        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}