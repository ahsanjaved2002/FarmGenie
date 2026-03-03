import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now();
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return React.createElement(
    ToastContext.Provider,
    { value: { toast, dismiss } },
    children,
    React.createElement(
      'div',
      { className: 'fixed top-4 right-4 z-50 space-y-2' },
      toasts.map((toast) =>
        React.createElement(
          'div',
          {
            key: toast.id,
            className: `p-4 rounded-lg shadow-lg border ${
              toast.variant === 'destructive'
                ? 'bg-red-500 text-white'
                : toast.variant === 'default'
                ? 'bg-white text-gray-800 border-gray-200'
                : 'bg-blue-500 text-white'
            }`
          },
          React.createElement(
            'div',
            { className: 'flex justify-between items-start' },
            React.createElement(
              'div',
              null,
              React.createElement(
                'div',
                { className: 'font-medium' },
                toast.title
              ),
              toast.description &&
                React.createElement(
                  'div',
                  { className: 'text-sm mt-1 opacity-90' },
                  toast.description
                )
            ),
            React.createElement(
              'button',
              {
                onClick: () => dismiss(toast.id),
                className: 'ml-4 text-lg hover:opacity-75'
              },
              '×'
            )
          )
        )
      )
    )
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
