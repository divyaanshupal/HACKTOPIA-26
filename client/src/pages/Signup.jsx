import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUser } from '../services/api';

// Internal SVGs for Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z" clipRule="evenodd" />
  </svg>
);

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        role: 'GENERAL', // Always set as general/student role
      };

      console.log(userData);

      const res = await createUser(userData);
      console.log(res);
      // Check HTTP status code (201 Created) or the specific string returned by backend
      if (res.status === 201 || res.data.status === 'new user created') {
        navigate('/');
      } else {
        // Prevent object rendering crash
        const errorMsg = typeof res.data.data === 'string' ? res.data.data : 'Signup failed';
        setError(errorMsg);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Styling constants (matching Login page)
  const inputGroupClass = "bg-[#F0F5FA] rounded-xl px-5 py-4 border-2 border-transparent focus-within:border-blue-500 transition-all flex items-center justify-between group";
  const inputClass = "bg-transparent w-full text-gray-800 font-semibold focus:outline-none placeholder-gray-400 text-base h-full pt-1";
  const labelClass = "text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-4";

  return (
    // Main Container: h-screen ensures it fills the window, w-full ensures full width
    <div className="h-screen w-full flex overflow-hidden bg-white font-sans">

      {/* --- LEFT SIDE: FORM (Full Height) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 z-10 relative bg-white overflow-y-auto">

        {/* Header Branding */}
        <div className="">
          <div className="flex items-center gap-4">
            {/* LOGO */}
            <img
              src="assets/img/iiit_logo.png"
              alt="IIIT Logo"
              className="w-12 h-12 object-contain"
            />
            <h3 className="font-bold text-gray-800 tracking-tight text-2xl lg:text-3xl">
              IIIT Bhagalpur
            </h3>
          </div>
        </div>

        {/* Center Content */}
        <div className="max-w-xl w-full mx-auto mt-16 lg:mt-8">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">Get Started</p>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Sign Up<span className="text-blue-600">.</span>
          </h1>
          <p className="text-gray-500 font-medium mb-8 text-lg">
            Create your account to access the system
          </p>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-5 py-4 rounded-xl text-base font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name Input */}
            <div>
              <label className={labelClass}>Full Name</label>
              <div className={inputGroupClass}>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <UserIcon />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div className={inputGroupClass}>
                <input
                  type="email"
                  name="email"
                  placeholder="official email id"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <MailIcon />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className={labelClass}>Password</label>
              <div className={inputGroupClass}>
                <input
                  type="password"
                  name="password"
                  placeholder="minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <LockIcon />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className={inputGroupClass}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <ShieldIcon />
              </div>
            </div>

            {/* Role Display */}
            <div>
              <label className={labelClass}>Role</label>
              <div className="bg-gray-100 rounded-xl px-5 py-4 border-2 border-gray-200 flex items-center justify-between">
                <span className="text-gray-500 font-semibold">General User / Student</span>
                <span className="text-xs text-gray-400 font-medium">Super Admin can modify</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-base text-gray-500">
              Already have an account?{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center mt-2">
          <p className="text-sm text-gray-400 font-medium">© IIIT Bhagalpur · Team Syntax Hackers</p>
        </div>
      </div>

      {/* --- RIGHT SIDE: IMAGE & WAVE (Full Height) --- */}
      <div className="hidden lg:block w-1/2 relative h-full">
        {/* Background Image */}
        <img
          src="assets/img/image.png"
          alt="IIIT Campus"
          className="w-full h-full object-cover"
        />

        {/* The Wave SVG Divider - Scaled to stretch full height */}
        <div className="absolute top-0 left-0 h-full w-auto">
          {/* Base White Wave */}
          <svg className="h-full w-auto" preserveAspectRatio="none" viewBox="0 0 250 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H200C200 0 320 250 180 400C50 550 180 750 280 850C380 950 250 1000 250 1000H0V0Z" fill="white" />
          </svg>
        </div>

        {/* Dashed Line Overlay - Separate for cleaner styling */}
        <div className="absolute top-0 left-0 h-full w-auto pointer-events-none">
          <svg className="h-full w-auto" preserveAspectRatio="none" viewBox="0 0 250 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M190 0C190 0 310 250 170 400C40 550 170 750 270 850C370 950 240 1000 240 1000" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="10 10" fill="none" />
          </svg>
        </div>

      </div>
    </div>
  );
}
