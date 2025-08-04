import React from 'react';
import { PasswordStrengthResult } from '@/utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrengthResult;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  if (strength.score === 0) return null;

  const getBarWidth = (index: number) => {
    if (strength.score > index) return '100%';
    return '0%';
  };

  const getBarColor = (index: number) => {
    if (strength.score > index) return strength.color;
    return '#2D3748';
  };

  return (
    <div className="mt-3 space-y-2">
      {/* 강도 표시 바 */}
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="flex-1 h-2 bg-[#2D3748] rounded-full overflow-hidden"
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: getBarWidth(index),
                backgroundColor: getBarColor(index),
              }}
            />
          </div>
        ))}
      </div>

      {/* 강도 텍스트 */}
      <div className="flex justify-between items-center">
        <span className="text-sm" style={{ color: strength.color }}>
          {strength.levelText}
        </span>
        <span className="text-xs text-[#A0AEC0]">
          {Object.values(strength.checks).filter(Boolean).length}/5
        </span>
      </div>

      {/* 체크리스트 */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <i className={`fas fa-${strength.checks.length ? 'check' : 'times'} text-xs`} 
             style={{ color: strength.checks.length ? '#48BB78' : '#F56565' }} />
          <span className="text-xs text-[#A0AEC0]">8자 이상</span>
        </div>
        <div className="flex items-center space-x-2">
          <i className={`fas fa-${strength.checks.lowercase ? 'check' : 'times'} text-xs`} 
             style={{ color: strength.checks.lowercase ? '#48BB78' : '#F56565' }} />
          <span className="text-xs text-[#A0AEC0]">소문자 포함</span>
        </div>
        <div className="flex items-center space-x-2">
          <i className={`fas fa-${strength.checks.uppercase ? 'check' : 'times'} text-xs`} 
             style={{ color: strength.checks.uppercase ? '#48BB78' : '#F56565' }} />
          <span className="text-xs text-[#A0AEC0]">대문자 포함</span>
        </div>
        <div className="flex items-center space-x-2">
          <i className={`fas fa-${strength.checks.numbers ? 'check' : 'times'} text-xs`} 
             style={{ color: strength.checks.numbers ? '#48BB78' : '#F56565' }} />
          <span className="text-xs text-[#A0AEC0]">숫자 포함</span>
        </div>
        <div className="flex items-center space-x-2">
          <i className={`fas fa-${strength.checks.symbols ? 'check' : 'times'} text-xs`} 
             style={{ color: strength.checks.symbols ? '#48BB78' : '#F56565' }} />
          <span className="text-xs text-[#A0AEC0]">특수문자 포함</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;