import { Toaster } from 'react-hot-toast';

const ToastConfig = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      style: {
        borderRadius: '0.5rem',
        background: '#fff',
        color: '#1f2937', 
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
      success: {
        style: {
          border: '1px solid #10b981', 
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      },
      error: {
        style: {
          border: '1px solid #ef4444', 
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      },
    }}
  />
);

export default ToastConfig;
