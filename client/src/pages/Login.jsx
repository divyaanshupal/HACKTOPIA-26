import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Internal SVGs for Icons
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(email, password);
      console.log(res);
      if (res.data.status === 'success') {
        const userData = res.data.data?.isuser;
        setUser(userData);
        const userRole = userData?.role;

        console.log('User role:', userRole);

        if (userRole === 'GENERAL') {
          navigate('/userDashboard');
        } else {
          navigate('/adminDashboard');
        }
      } else {
        setError(res.data.messege || 'Invalid credentials');
      }
    } catch {
      setError('Server error. Please try again later.');
    }
  };

  // Styling constants
  const inputGroupClass = "bg-[#F0F5FA] rounded-xl px-5 py-4 border-2 border-transparent focus-within:border-blue-500 transition-all flex items-center justify-between group";
  const inputClass = "bg-transparent w-full text-gray-800 font-semibold focus:outline-none placeholder-gray-400 text-base h-full pt-1";
  const labelClass = "text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-4";

  return (
    // Main Container: h-screen ensures it fills the window, w-full ensures full width
    <div className="h-screen w-full flex overflow-hidden bg-white font-sans">

      {/* --- LEFT SIDE: FORM (Full Height) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-20 xl:p-32 z-10 relative bg-white">

        {/* Header Branding */}
        {/* <div className="absolute top-10 left-8 lg:left-20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600"></div>
            <h3 className="font-bold text-gray-800 tracking-tight text-xl">IIIT Bhagalpur</h3>
          </div>
          
        </div> */}
        <div className="absolute top-10 left-8 lg:left-24">
          <div className="flex items-center gap-4">
            {/* LOGO ADDED HERE */}
            <img
              src="assets/img/iiit_logo.png"
              alt="IIIT Logo"
              className="w-12 h-12 object-contain"
            />
            {/* TEXT SIZE INCREASED HERE */}
            <h3 className="font-bold text-gray-800 tracking-tight text-2xl lg:text-3xl">
              IIIT Bhagalpur
            </h3>
          </div>
        </div>

        {/* Center Content */}
        <div className="max-w-xl w-full mx-auto">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">Welcome Back</p>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Login<span className="text-blue-600">.</span>
          </h1>
          <p className="text-gray-500 font-medium mb-10 text-lg">
            Integrated File Tracking & Workflow Management System
          </p>

          {error && (
            <div className="mb-8 bg-red-50 text-red-600 px-5 py-4 rounded-xl text-base font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Input */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div className={inputGroupClass}>
                <input
                  type="email"
                  placeholder="official email id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                <LockIcon />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 text-lg"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-10 text-center lg:text-left">
            <p className="text-base text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 w-full text-center lg:text-left lg:pl-20">
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
        {/* We use h-full to ensure the wave stretches from top to bottom of the viewport */}
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