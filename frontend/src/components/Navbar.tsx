import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, BookOpen, Settings, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import logo1 from '../Assets/mba_logo.jpg';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [avatar, setAvatar]=useState("")


  useEffect(() => {
  if (user?.avatar) {
    setAvatar(user.avatar);
  } else {
    setAvatar("");
  }
}, [user,avatar]);


  // Close mobile menu when route changes
  useEffect(() => {
    
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      default:
        return '/lms';
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'LMS', path: '/lms' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 p-1 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex justify-center items-center space-x-2">
            <img src={logo1} alt="" className="w-8 h-8 object-cover scale-150 rounded-full" />
            {/* <span className="font-heading font-bold text-xl text-neutral-800">
              MBA
            </span> */}
          </Link>

          

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-custom-red border-b-2 border-custom-red pb-1'
                    : 'text-neutral-600 hover:text-custom-red'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <span className="font-medium text-neutral-700">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-800">{user.name}</p>
                      <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
                    </div>
                    
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <GoogleLoginButton />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100"
            >
              
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}

            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-16 w-full bg-white border-t border-neutral-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile User Menu */}
          <div className="pt-4 pb-3 border-t border-neutral-200">
            {isAuthenticated && user ? (
              <div className="px-4">
                <div className="flex items-center space-x-3 mb-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-neutral-800">{user.name}</p>
                    <p className="text-sm text-neutral-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                
<GoogleLoginButton  />
  
                
</div>

            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;