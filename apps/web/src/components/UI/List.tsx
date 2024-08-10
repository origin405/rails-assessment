import React, { useState } from 'react';
import { Droppable, DroppableProvided } from 'react-beautiful-dnd';
import Card from './Card';
import AddCard from './AddCard';

interface ListProps {
  id: string;
  title: string;
  cards: Array<{ id: string; content: string }>;
  onDeleteList: (listId: string) => void;
  onAddCard: (listId: string, cardContent: string) => void;
  onUpdateListTitle: (listId: string, newTitle: string) => void;
  onUpdateCard: (cardId: string, newContent: string) => void;  
  onDeleteCard: (cardId: string) => void;  
}

const List: React.FC<ListProps> = ({ id, title, cards, onDeleteList, onAddCard, onUpdateListTitle, onUpdateCard, onDeleteCard }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleTitleSubmit = () => {
    if (newTitle.trim() !== title) {
      onUpdateListTitle(id, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden flex flex-col w-72 select-none">
      <div className="p-2 flex justify-between items-center bg-zinc-900 mb-2">
        {isEditingTitle ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="bg-zinc-900 text-gray-100 px-2 rounded"
            autoFocus
          />
        ) : (
          <h3 
            className="font-semibold text-gray-100 cursor-pointer px-2"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h3>
        )}
        {!isDeleting ? (
          <button
            onClick={() => setIsDeleting(true)}
            className="text-gray-400 hover:text-gray-100"
          >
            ✕
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => onDeleteList(id)}
              className="text-green-500 hover:text-green-400"
            >
              ✓
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="text-gray-400 hover:text-gray-100"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <Droppable droppableId={id} type="CARD">
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="px-2 flex flex-col space-y-2 overflow-y-auto py-3"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {cards.map((card, index) => (
              <Card key={card.id} id={card.id} content={card.content} index={index} onUpdateCard={onUpdateCard} onDeleteCard={onDeleteCard} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div className="p-2 bg-zinc-900">
        <AddCard onAddCard={(content) => onAddCard(id, content)} />
      </div>
    </div>
  );
};

export default List;