import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from './ui/Toaster';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;