'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

export default function Navbar({ hideContact = false }: { hideContact?: boolean }) {
  const { user, profile, isAdmin, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (err) {
      console.error('Log out failed:', err);
    }
  };

  return (
    <nav className="bg-black text-white border-b border-white/10 relative z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors uppercase">
            <img
              src="/my-logo.png"
              alt="CSC Logo"
              className="w-8 h-8 object-contain"
            />
            <span>CENTRAL SCHOOL OF COMMERCE</span>
          </Link>

          <div className="flex items-center gap-6" ref={dropdownRef}>

            <Link href="/dashboard" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
              Dashboard
            </Link>

            {/* Typing Tests Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'tests' ? null : 'tests')}
                className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                Typing Tests
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'tests' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'tests' && (
                <div className="absolute top-full mt-2 bg-black border border-white/10 rounded-xl shadow-xl py-2 min-w-max w-auto whitespace-nowrap z-50">
                  <div>
                    <p className="px-4 py-2 text-xs font-bold tracking-wider text-indigo-400 uppercase">English</p>
                    <Link href="/typing-test/english/junior" className="block px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors">
                      Junior (30 WPM / 1500)
                    </Link>
                    <Link href="/typing-test/english/senior" className="block px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors">
                      Senior (45 WPM / 2250)
                    </Link>
                  </div>

                  <hr className="my-2 border-white/10" />

                  <div>
                    <p className="px-4 py-2 text-xs font-bold tracking-wider text-indigo-400 uppercase">Tamil</p>
                    <Link href="/typing-test/tamil/junior" className="block px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors">
                      Junior (30 WPM / 1500)
                    </Link>
                    <Link href="/typing-test/tamil/senior" className="block px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors">
                      Senior (45 WPM / 2250)
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/leaderboard" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
              Leaderboard
            </Link>

            {!hideContact && (
              <Link href="/contact" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                Contact
              </Link>
            )}

            <ThemeToggle />

            {/* 🛡️ ADMIN PANEL BUTTON */}
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-zinc-900 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400 font-bold px-4 py-2 h-10 flex items-center justify-center rounded-lg transition-all whitespace-nowrap shadow-sm shadow-indigo-500/10"
              >
                Admin Panel
              </Link>
            )}

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
                className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {profile?.full_name || 'Account'}
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${openDropdown === 'profile' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'profile' && (
                <div className="absolute top-full mt-2 bg-black border border-white/10 rounded-xl shadow-xl py-2 min-w-max w-auto whitespace-nowrap z-50 right-0">
                  <div className="px-4 py-3 border-b border-white/10 mb-1 max-w-[180px]">
                    <p className="font-bold text-sm text-indigo-400 truncate">{profile?.full_name || 'Typist'}</p>
                    <p className="text-xs font-medium text-zinc-400 truncate">{user?.email}</p>
                  </div>

                  <Link href="/profile" className="block px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors">
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:text-red-400 font-bold hover:bg-red-500/10 transition-colors mt-1"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}