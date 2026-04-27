import Sidebar from './Sidebar';
import NotificationsBell from './NotificationsBell';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <Sidebar />
      <main className="flex-1 relative overflow-x-hidden">
        <div className="absolute top-6 right-8 z-50 flex items-center gap-3">
          <ThemeToggle />
          <NotificationsBell />
        </div>
        <div className="p-8 pb-16 pt-16 animate-fade-in min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
