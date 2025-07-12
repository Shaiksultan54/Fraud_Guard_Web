import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, FileSpreadsheet, PieChart, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-slate-800 dark:text-white">FraudGuard</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <NavLink to="/" active={isActive('/')}>
              <Home className="h-4 w-4 mr-1" />
              Home
            </NavLink>
            <NavLink to="/single-prediction" active={isActive('/single-prediction')}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Single Prediction
            </NavLink>
            <NavLink to="/bulk-upload" active={isActive('/bulk-upload')}>
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Bulk Upload
            </NavLink>
            <NavLink to="/data-visualization" active={isActive('/data-visualization')}>
              <PieChart className="h-4 w-4 mr-1" />
              Visualization
            </NavLink>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="md:hidden">
            <button
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav - simplified for now */}
      <div className="md:hidden flex overflow-x-auto pb-2 pt-1 px-4 border-t border-slate-200 dark:border-slate-700">
        <MobileNavLink to="/" active={isActive('/')}>
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </MobileNavLink>
        <MobileNavLink to="/single-prediction" active={isActive('/single-prediction')}>
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs">Predict</span>
        </MobileNavLink>
        <MobileNavLink to="/bulk-upload" active={isActive('/bulk-upload')}>
          <FileSpreadsheet className="h-5 w-5" />
          <span className="text-xs">Upload</span>
        </MobileNavLink>
        <MobileNavLink to="/data-visualization" active={isActive('/data-visualization')}>
          <PieChart className="h-5 w-5" />
          <span className="text-xs">Charts</span>
        </MobileNavLink>
      </div>
    </nav>
  );
};

type NavLinkProps = {
  to: string;
  active: boolean;
  children: React.ReactNode;
};

const NavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      active
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center mx-3 py-1 px-2 rounded-md transition-colors duration-150 ${
      active
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;