import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextType = {
  toast: (props: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, ...props }]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 max-h-screen overflow-hidden flex flex-col-reverse gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (toast.variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div 
      className={`
        max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg 
        border-l-4 
        ${toast.variant === 'success' ? 'border-green-500' : ''}
        ${toast.variant === 'destructive' ? 'border-red-500' : ''}
        ${toast.variant === 'warning' ? 'border-amber-500' : ''}
        ${toast.variant === 'default' || !toast.variant ? 'border-blue-500' : ''}
        animate-slide-in
      `}
      style={{ animationDuration: '0.2s' }}
    >
      <div className="flex p-4">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-900 dark:text-slate-100">{toast.title}</h3>
          {toast.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export const Toaster: React.FC = () => {
  return null; // Actual implementation is in ToastProvider
};

export const toast = (props: Omit<Toast, 'id'>) => {
  const root = document.getElementById('root');
  if (!root) return;

  // Create a temporary element to render the ToastProvider
  const tempDiv = document.createElement('div');
  const toastContext = {
    toast: (toastProps: Omit<Toast, 'id'>) => {
      const toast = document.querySelector('.toast-container');
      if (toast) {
        const id = Math.random().toString(36).substring(2, 9);
        const toastElement = document.createElement('div');
        toastElement.className = 'toast';
        toastElement.dataset.id = id;
        toast.appendChild(toastElement);
      }
    },
  };

  // Add the toast to the context
  toastContext.toast(props);
};

export default ToastProvider;