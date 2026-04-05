import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    dob: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // 2. Insert extra fields into public.profiles
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: formData.fullName,
            email_id: formData.email,
            mobile_number: formData.mobileNumber,
            date_of_birth: formData.dob
          }
        ]);
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      // Success, route to dashboard or login
      navigate('/');
      
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Central School of Commerce</h1>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Create an Account</h2>
        </div>
        
        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input required type="text" name="fullName" className="form-input" value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email ID</label>
            <input required type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input required type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="••••••••" minLength={6} />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input required type="tel" name="mobileNumber" className="form-input" value={formData.mobileNumber} onChange={handleChange} placeholder="1234567890" />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input required type="date" name="dob" className="form-input" value={formData.dob} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}
