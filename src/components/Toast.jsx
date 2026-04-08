import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const Toast = () => {
  const { toast } = useAppContext();

  if (!toast.show) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[toast.type] || 'bg-slate-500';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
      >
        <span className="text-xl">
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '✗'}
          {toast.type === 'info' && 'ℹ'}
        </span>
        <span className="font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
