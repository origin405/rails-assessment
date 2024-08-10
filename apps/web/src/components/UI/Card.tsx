import React, { useState } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

interface CardProps {
  id: string;
  content: string;
  index: number;
  onUpdateCard: (cardId: string, newContent: string) => void;
  onDeleteCard: (cardId: string) => void;
}

const Card: React.FC<CardProps> = ({ id, content, index, onUpdateCard, onDeleteCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);

  const handleSubmit = () => {
    if (newContent.trim() !== content) {
      onUpdateCard(id, newContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided: DraggableProvided) => (
        <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="bg-slate-800 rounded p-2 text-gray-100 hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-sky-500 transition-colors duration-200 relative group"
      >
          {isEditing ? (
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onBlur={handleSubmit}
              className="w-full bg-gray-600 text-gray-100 rounded p-1 outline-none"
              autoFocus
            />
          ) : (
            <>
              <p className="pr-6" onClick={() => setIsEditing(true)}>{content}</p>
              <button
                onClick={() => onDeleteCard(id)}
                className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                ✕
              </button>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Card;