import React, { useState } from 'react';

interface AddCardProps {
  onAddCard: (content: string) => void;
}

const AddCard: React.FC<AddCardProps> = ({ onAddCard }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAddCard(content.trim());
      setContent('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="text-gray-400 hover:text-gray-100 hover:bg-zinc-700 w-full text-left rounded-md px-3 py-2"
      >
        + Add a card
      </button>
    );
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter card content..."
        className="w-full p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none"
        rows={3}
      />
      <div className="flex justify-between mt-2">
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white font-medium py-1 px-3 rounded"
        >
          Add Card
        </button>
        <button
          onClick={() => {
            setIsAdding(false);
            setContent('');
          }}
          className="text-gray-400 hover:text-gray-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AddCard;