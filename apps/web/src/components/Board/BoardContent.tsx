// components/BoardContent.tsx
import React from 'react';
import { useAtom } from 'jotai';
// import { boardAtom } from '@/atoms/boardAtoms';
// import List from './List';

const BoardContent: React.FC = () => {
//   const [board] = useAtom(boardAtom);

  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="max-w-full h-full px-4 sm:px-6 lg:px-8 py-8 flex space-x-4">
        {/* {board.lists.map((list) => (
          <List key={list.id} list={list} />
        ))} */}
        <div className="flex-shrink-0 w-72">
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded">
            + Add another list
          </button>
        </div>
      </div>
    </main>
  );
};

export default BoardContent;