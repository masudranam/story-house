import { useState } from 'react';
import { ThumbsUp } from 'lucide-react'; // Optional icon library
import API from '../services/api';

interface LikeButtonProps {
  likesCount: number;
  userLiked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const LikeButton = ({
  likesCount,
  userLiked,
  onToggle,
  disabled = false
}: LikeButtonProps) => {
 
  return (
    <div className="flex items-center gap-2 mt-4 cursor-pointer text-gray-600">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          userLiked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
      >
        <ThumbsUp size={16} />
        <span className="text-sm font-medium">{userLiked ? 'Liked' : 'Like'}</span>
      </button>
      <span className="text-sm">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
    </div>
  );
};

export default LikeButton;
