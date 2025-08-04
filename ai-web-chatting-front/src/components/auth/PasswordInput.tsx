'use client';

import React, { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
        <i className="fas fa-lock"></i>
      </div>
      <input
        type={showPassword ? "text" : "password"}
        className="w-full bg-[#2D3748]/30 border border-[#4A5568]/50 rounded-lg py-3 pl-10 pr-10 text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all"
        placeholder="비밀번호"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#718096] hover:text-white transition-colors cursor-pointer !rounded-button whitespace-nowrap"
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
      </button>
    </div>
  );
};

export default PasswordInput;