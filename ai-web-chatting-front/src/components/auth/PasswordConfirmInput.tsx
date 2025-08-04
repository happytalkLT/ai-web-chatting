'use client';

import React, { useState } from 'react';

interface PasswordConfirmInputProps {
  value: string;
  onChange: (value: string) => void;
  password: string;
}

const PasswordConfirmInput: React.FC<PasswordConfirmInputProps> = ({ value, onChange, password }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isMatching = password === value;
  const showValidation = value.length > 0;

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
          <i className="fas fa-lock"></i>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          className={`w-full bg-[#2D3748]/30 border ${
            showValidation 
              ? isMatching 
                ? 'border-green-500/50 focus:ring-green-500/50' 
                : 'border-red-500/50 focus:ring-red-500/50'
              : 'border-[#4A5568]/50 focus:ring-[#0066FF]/50'
          } rounded-lg py-3 pl-10 pr-10 text-white placeholder-[#718096] focus:outline-none focus:ring-2 transition-all`}
          placeholder="비밀번호 확인"
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
      {showValidation && !isMatching && (
        <p className="text-red-400 text-sm mt-1">비밀번호가 일치하지 않습니다</p>
      )}
      {showValidation && isMatching && (
        <p className="text-green-400 text-sm mt-1">비밀번호가 일치합니다</p>
      )}
    </div>
  );
};

export default PasswordConfirmInput;