import React from 'react';

interface DeleteConfirmPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string; 
}

const DeleteConfirmPopup: React.FC<DeleteConfirmPopupProps> = ({
  onConfirm,
  onCancel,
  loading = false,
  className,
}) => {
  return (
    <div className={`${className} z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-6`}>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 font-medium text-sm disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Deleting...
            </span>
          ) : (
            'Yes, Delete'
          )}
        </button>

        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmPopup;
