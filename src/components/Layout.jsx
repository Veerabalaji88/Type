import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>CSC</span>
            <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>Central School of Commerce</span>
          </Link>

          {/* Desktop Nav Tools */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Dashboard</Link>
            
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => toggleDropdown('tests')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Typing Tests <ChevronDown size={16} />
              </div>
              {activeDropdown === 'tests' && (
                <div style={{ position: 'absolute', top: '100%', left: '0', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '200px', zIndex: 50, boxShadow: 'var(--shadow-lg)', marginTop: '0.5rem' }}>
                  <div style={{ fontWeight: '600', padding: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>English</div>
                  <Link to="/test/english/junior" style={{ display: 'block', padding: '0.5rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Junior (30 WPM)</Link>
                  <Link to="/test/english/senior" style={{ display: 'block', padding: '0.5rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Senior (45 WPM)</Link>
                  
                  <div style={{ fontWeight: '600', padding: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Tamil</div>
                  <Link to="/test/tamil/junior" style={{ display: 'block', padding: '0.5rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Junior (30 WPM)</Link>
                  <Link to="/test/tamil/senior" style={{ display: 'block', padding: '0.5rem', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--background)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Senior (45 WPM)</Link>
                </div>
              )}
            </div>

            <Link to="/contact" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Contact Us</Link>
            
            {isAdmin && (
              <Link to="/admin" style={{ fontWeight: '500', color: 'var(--error)' }}>Admin Panel</Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      
      <footer style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Central School of Commerce. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
