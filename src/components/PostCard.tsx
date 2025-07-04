import { useState } from 'react';

interface Props {
  title: string;
  description: string;
  author: string;
  date: string;
}

const PostCard = ({ title, description, author, date }: Props) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <>
     
      <div
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition"
        onClick={() => setShowFull(true)}
      >
        <h3 className="text-xl font-semibold text-blue-800">{title}</h3>
        <p className="mt-2 text-gray-700 line-clamp-3">{description}</p>
        <small className="text-gray-500 mt-3 block">
          By {author} on {new Date(date).toLocaleDateString()}
        </small>
      </div>

     
      {showFull && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFull(false)}
        >
       
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-blue-900">{title}</h2>
            <p className="mt-4 text-gray-800 whitespace-pre-wrap">{description}</p>
            <small className="block mt-4 text-gray-500">
              By {author} on {new Date(date).toLocaleDateString()}
            </small>
            <button
              onClick={() => setShowFull(false)}
              className="mt-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
