import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white/80 rounded-xl mx-4 mt-4 shadow-sm">
      <nav className="flex items-center justify-between px-6 py-3">

        {/* Left */}
        <h5 className="text-lg font-semibold text-gray-800">
          Dashboard
        </h5>

        {/* Right */}
        <div className="flex items-center space-x-6">

          {/* Notification */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 transition"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6z"
                />
              </svg>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg border z-50">
                <div className="px-4 py-3 text-sm text-gray-700">
                  🔔 Notification!!!
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="flex items-center space-x-2 text-gray-700">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.121 17.804A9 9 0 1 1 18.364 4.636 9 9 0 0 1 5.12 17.804z"
              />
            </svg>
            <span className="hidden sm:inline font-medium">
              {user?.name || 'Guest'}
            </span>
          </div>

        </div>
      </nav>
    </header>
  );
}
