import React, { useState } from 'react';

const TestLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Main Container (Ignoring the grey background, focusing on the card)
    <div className="flex justify-center items-center min-h-screen font-sans p-4">
      
      {/* The Card Component */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1200px] h-auto lg:h-[800px] bg-[#FDFDFD] rounded-[40px] shadow-2xl overflow-hidden relative">
        
        {/* --- LEFT SIDE: FORM --- */}
        <div className="w-full lg:w-[45%] p-10 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-[#F5F5F7] via-[#FDFDFD] to-[#FDF8D8]">
          
          {/* Logo */}
          <div className="self-start">
            <div className="border border-gray-400 rounded-full px-6 py-2">
              <span className="text-gray-700 font-medium tracking-wide">Crextio</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex flex-col mt-8 lg:mt-0">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-normal mb-2 text-center lg:text-left">
              Create an account
            </h1>
            <p className="text-gray-500 mb-10 text-center lg:text-left">
              Sing up and get 30 day free trial
            </p>

            <form className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500 ml-1">Full name</label>
                <input 
                  type="text" 
                  defaultValue="Amélie Laurent"
                  className="w-full bg-[#EFEFEF] rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500 ml-1">Email</label>
                <input 
                  type="email" 
                  defaultValue="amélielaurent7622@gmail.com"
                  className="w-full bg-[#EFEFEF] rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    defaultValue="password123"
                    className="w-full bg-[#EFEFEF] rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                   {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-[#FCE258] hover:bg-[#FCD34D] text-gray-800 font-medium py-4 rounded-full mt-4 transition-colors shadow-sm text-lg">
                Submit
              </button>
            </form>

            {/* Social Login */}
            <div className="flex gap-4 mt-6">
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-full py-3 hover:bg-gray-50 transition-colors">
                <AppleIcon />
                <span className="text-gray-700 font-medium">Apple</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-full py-3 hover:bg-gray-50 transition-colors">
                <GoogleIcon />
                <span className="text-gray-700 font-medium">Google</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-10 text-xs text-gray-500 border-t lg:border-none pt-4 lg:pt-0">
            <p>Have any account? <a href="#" className="text-gray-800 underline font-medium">Sing in</a></p>
            <a href="#" className="underline">Terms & Conditions</a>
          </div>
        </div>

        {/* --- RIGHT SIDE: IMAGE & OVERLAYS --- */}
        <div className="w-full lg:w-[55%] relative hidden lg:block h-full">
          {/* Background Image */}
          <img src="assets/img/image.png" 
            alt="Office Team" 
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Darkener (Optional, for text readability if image is bright) */}
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Close Button */}
          <button className="absolute top-8 right-8 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full text-gray-800 transition-all">
            <CloseIcon />
          </button>

          {/* OVERLAY WIDGET: Task Review (Top Left) */}
          <div className="absolute top-16 left-12">
            <div className="bg-[#FCE258] p-4 rounded-2xl shadow-lg w-64 relative">
               {/* Small decorative dot */}
               <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
               <p className="text-sm font-medium text-gray-800">Task Review With Team</p>
               <p className="text-xs text-gray-600 mt-1">09:30am-10:00am</p>
            </div>
             {/* Stacked effect behind */}
             <div className="bg-black/60 p-4 rounded-2xl w-64 absolute top-4 left-4 -z-10 mt-2">
                 <p className="text-xs text-gray-400 opacity-0">Hidden</p>
             </div>
          </div>

          {/* OVERLAY WIDGET: Calendar & Avatars (Middle Right) */}
          <div className="absolute top-[40%] right-0 pr-8 pl-8 w-full flex flex-col items-end pointer-events-none">
            
            {/* Avatars */}
            <div className="flex flex-col gap-3 items-end mb-6 pointer-events-auto">
               <div className="bg-white/90 p-1 rounded-full shadow-lg">
                 <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-10 h-10 rounded-full object-cover" alt="User" />
               </div>
               <div className="relative right-4">
                 <div className="bg-white/90 p-1 rounded-full shadow-lg">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-12 h-12 rounded-full object-cover" alt="User" />
                 </div>
               </div>
               <div className="bg-white/90 p-1 rounded-full shadow-lg">
                  <img src="https://i.pravatar.cc/150?u=a04258114e29026302d" className="w-10 h-10 rounded-full object-cover" alt="User" />
               </div>
            </div>

            {/* Glassmorphism Calendar Strip */}
            <div className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 text-white pointer-events-auto relative overflow-hidden">
                {/* Decorative diagonal lines for texture */}
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-20" 
                     style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 12px)'}}>
                </div>

                <div className="flex justify-between items-center text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                        <div key={day} className="flex flex-col gap-2">
                            <span className="text-xs font-light text-white/80">{day}</span>
                            <span className={`text-lg font-medium ${i === 2 ? 'text-white' : 'text-white/80'}`}>
                                {22 + i}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* OVERLAY WIDGET: Daily Meeting (Bottom Left) */}
          <div className="absolute bottom-20 left-12">
              <div className="bg-white p-5 rounded-2xl shadow-xl w-64 relative">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <h3 className="font-semibold text-gray-800">Daily Meeting</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">12:00pm-01:00pm</p>
                  
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=1" alt=""/>
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=2" alt=""/>
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=3" alt=""/>
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?u=4" alt=""/>
                  </div>
              </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

/* --- SVGs for Icons --- */

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.2 2c-.1.7-.5 1.3-1 1.7-.5.4-1.1.5-1.8.4.1-.7.5-1.3 1-1.7.5-.4 1.1-.6 1.8-.4zM12.9 4c-1.3 0-2.3.7-2.8.7-.5 0-1.4-.7-2.3-.7-1.2 0-2.3.7-3 1.8-1.3 2.3-.3 5.7 1 7.6.6.9 1.4 1.9 2.4 1.9.9 0 1.3-.6 2.4-.6 1.1 0 1.5.6 2.4.6 1 0 1.7-.9 2.3-1.8.7-1 .9-2 .9-2.1-.1 0-1.7-.7-1.7-2.6 0-1.6 1.3-2.4 1.4-2.5-1.1-1.6-2.6-1.7-3-1.7z" />
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default TestLogin;