'use client';
import { useState, useCallback } from 'react';
import { Menu, X, ChevronDown, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import ProfileDropdown from './ProfileDropdown';
import useAuthStore from '@/utility/justAuth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false); // Kept for consistency
  const [browseOpen, setBrowseOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isLoggedIn, logout } = useAuthStore();

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      logout();
      localStorage.clear();
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  // Memoized mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setOpen((prev) => !prev);
    if (browseOpen) setBrowseOpen(false);
  }, [browseOpen]);

  const browseOptions = [
    'Book', 'Book Chapters', 'Conference Proceeding', 'Dissertation',
    'Magazine', 'Manuscript', 'Newspaper', 'Question Papers', 'Research Papers', 'Thesis'
  ];

  return (
    <header
      className="bg-white text-gray-800 shadow-md border-b relative z-[100]"
      style={{ backgroundColor: '#ffffff' }}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
        {/* Left Side - Logo only */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center" aria-label="Home">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12"
              loading="lazy"
            />
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center justify-center space-x-12 font-bold text-sm flex-1">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors"
            aria-label="Home"
          >
            HOME
          </Link>

          {/* Browse Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setBrowseOpen(true)}
            onMouseLeave={() => setBrowseOpen(false)}
          >
            <button
              onClick={() => setBrowseOpen(!browseOpen)}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
              aria-expanded={browseOpen}
              aria-controls="browse-dropdown"
              aria-label="Browse content types"
            >
              BROWSE
              <ChevronDown
                size={16}
                className={`transition-transform ${browseOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {browseOpen && (
              <div className="absolute top-full left-0 pt-2 w-56 z-[110]" id="browse-dropdown">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-2 max-h-96 overflow-y-auto">
                    {browseOptions.map((option) => (
                      <Link
                        key={option}
                        href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setBrowseOpen(false)}
                      >
                        {option}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/subjects"
            className="hover:text-blue-600 transition-colors"
            aria-label="Subjects"
          >
            SUBJECTS
          </Link>
        </nav>

        {/* Right Side - Simple Login Button matching Home style */}
        <div className="hidden md:block">
          {isLoggedIn ? (
            <ProfileDropdown onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: 'rgba(0, 188, 212, 0.9)' }}
              aria-label="Login"
            >
              <User size={16} className="text-white" />
              <span className="font-medium">Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden p-2 text-gray-800 hover:text-blue-600 transition-colors"
          onClick={toggleMobileMenu}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Simple Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white relative z-[110]">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Home"
            >
              HOME
            </Link>

            {/* Mobile Browse */}
            <div className="w-full">
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                className="w-full flex items-center justify-between py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                aria-expanded={browseOpen}
                aria-controls="mobile-browse-dropdown"
                aria-label="Browse content types"
              >
                <span>BROWSE</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${browseOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {browseOpen && (
                <div className="mt-2 ml-4 space-y-1 max-h-48 overflow-y-auto" id="mobile-browse-dropdown">
                  {browseOptions.map((option) => (
                    <Link
                      key={option}
                      href={`/type/${encodeURIComponent(option.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block py-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      {option}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/subjects"
              className="block py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Subjects"
            >
              SUBJECTS
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-gray-200">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={toggleMobileMenu}
                    aria-label="Dashboard"
                  >
                    DASHBOARD
                  </Link>
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      handleLogout();
                    }}
                    className="block py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                    disabled={isLoggingOut}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? 'LOGGING OUT...' : 'LOGOUT'}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="block py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={toggleMobileMenu}
                  aria-label="Login"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}