import React from 'react';

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718096]">
        <i className="fas fa-user"></i>
      </div>
      <input
        type="text"
        className="w-full bg-[#2D3748]/30 border border-[#4A5568]/50 rounded-lg py-3 pl-10 pr-3 text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all"
        placeholder="이름"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default NameInput;