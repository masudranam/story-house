import React from 'react';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <div className="absolute top-2 right-2 flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConfirm();
        }}
        disabled={loading}
        className="text-sm text-white bg-red-500 px-3 py-1 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 flex items-center"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
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
            Deleting
          </span>
        ) : (
          'Confirm'
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200"
      >
        Cancel
      </button>
    </div>
  );
};

export default DeleteConfirmModal;



 // <div className="absolute top-2 right-2 flex gap-2">
                  //   <button
                  //     onClick={(e) => {
                  //       e.stopPropagation();
                  //       handleDelete(c.id);
                  //     }}
                  //     disabled={deleteLoading}
                  //     className="text-sm text-white bg-red-500 px-3 py-1 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 flex items-center"
                  //   >
                  //     {deleteLoading ? (
                  //       <span className="flex items-center">
                  //         <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  //           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  //           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  //         </svg>
                  //         Deleting
                  //       </span>
                  //     ) : (
                  //       'Confirm'
                  //     )}
                  //   </button>
                  //   <button
                  //     onClick={(e) => {
                  //       e.stopPropagation();
                  //       setDeleteConfirmId(null);
                  //     }}
                  //     className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200"
                  //   >
                  //     Cancel
                  //   </button>
                  // </div>
