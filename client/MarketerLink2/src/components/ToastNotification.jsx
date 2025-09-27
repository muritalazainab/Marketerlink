import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm transition-all duration-300 transform";
    
    const typeStyles = {
      success: "bg-green-50/90 border-green-400 text-green-800",
      error: "bg-red-50/90 border-red-400 text-red-800",
      warning: "bg-yellow-50/90 border-yellow-400 text-yellow-800",
      info: "bg-blue-50/90 border-blue-400 text-blue-800"
    };

    const animationStyles = isLeaving 
      ? "translate-x-full opacity-0" 
      : isVisible 
        ? "translate-x-0 opacity-100" 
        : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[toast.type]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };
    
    switch (toast.type) {
      case 'success': return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-green-600" />;
      case 'error': return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-red-600" />;
      case 'warning': return <AlertCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-yellow-600" />;
      case 'info': return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-600" />;
      default: return <Info {...iconProps} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1">
        <p className="font-medium text-sm">{toast.message}</p>
      </div>
      <button
        onClick={handleRemove}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Example usage component to demonstrate the toast system
const ToastExample = () => {
  const toast = useToast();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Toast Notification System</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => toast.success('Profile saved successfully!')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Success Toast
        </button>
        
        <button
          onClick={() => toast.error('Failed to save profile. Please try again.')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Error Toast
        </button>
        
        <button
          onClick={() => toast.warning('Please fill in all required fields.')}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Warning Toast
        </button>
        
        <button
          onClick={() => toast.info('Application submitted successfully!')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Info Toast
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Usage in your components:</h3>
        <pre className="text-sm text-gray-700 overflow-x-auto">
{`// Import and use
import { useToast } from './ToastNotification';

const MyComponent = () => {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong!');
  };
}`}
        </pre>
      </div>
    </div>
  );
};

// Main App component with ToastProvider
const App = () => {
  return (
    <ToastProvider>
      <ToastExample />
    </ToastProvider>
  );
};

export default App;