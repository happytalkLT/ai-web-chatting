import React from 'react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
        <i className="fas fa-envelope"></i>
      </div>
      <input
        type="email"
        className="w-full bg-[#2D3748]/30 border border-[#4A5568]/50 rounded-lg py-3 pl-10 pr-3 text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all"
        placeholder="이메일"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default EmailInput;