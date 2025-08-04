export interface PasswordStrengthResult {
  score: number; // 0-4 (0: 매우 약함, 1: 약함, 2: 보통, 3: 강함, 4: 매우 강함)
  level: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  levelText: string;
  color: string;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  suggestions: string[];
}

export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  let score = 0;
  let level: PasswordStrengthResult['level'] = 'very-weak';
  let levelText = '';
  let color = '';

  if (password.length === 0) {
    score = 0;
    level = 'very-weak';
    levelText = '';
    color = '#4A5568';
  } else if (passedChecks < 2) {
    score = 1;
    level = 'very-weak';
    levelText = '매우 약함';
    color = '#F56565';
  } else if (passedChecks < 3) {
    score = 2;
    level = 'weak';
    levelText = '약함';
    color = '#ED8936';
  } else if (passedChecks < 4) {
    score = 3;
    level = 'fair';
    levelText = '보통';
    color = '#ECC94B';
  } else if (passedChecks < 5) {
    score = 4;
    level = 'strong';
    levelText = '강함';
    color = '#48BB78';
  } else {
    score = 5;
    level = 'very-strong';
    levelText = '매우 강함';
    color = '#38A169';
  }

  const suggestions: string[] = [];
  if (!checks.length) suggestions.push('8자 이상 입력하세요');
  if (!checks.lowercase) suggestions.push('소문자를 포함하세요');
  if (!checks.uppercase) suggestions.push('대문자를 포함하세요');
  if (!checks.numbers) suggestions.push('숫자를 포함하세요');
  if (!checks.symbols) suggestions.push('특수문자를 포함하세요');

  return {
    score,
    level,
    levelText,
    color,
    checks,
    suggestions,
  };
};