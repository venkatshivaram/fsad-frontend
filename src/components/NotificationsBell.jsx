import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const NotificationsBell = () => {
  const { notifications = [], markNotificationRead, markAllNotificationsRead } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-200/50 transition-colors focus:outline-none"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <span className="text-3xl block mb-2">📭</span>
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                        if (!notif.isRead) markNotificationRead(notif.id);
                    }}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                      notif.isRead ? 'opacity-60' : 'bg-indigo-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-indigo-500 animate-pulse'}`} />
                      <div>
                        <p className={`text-sm ${notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-800 font-bold'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                          {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
