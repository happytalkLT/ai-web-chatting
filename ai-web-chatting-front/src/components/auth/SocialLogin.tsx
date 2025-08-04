import React from 'react';

const SocialLogin: React.FC = () => {
  const handleSocialLogin = (provider: string) => {
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        type="button"
        className="flex justify-center items-center bg-[#2D3748]/50 hover:bg-[#2D3748]/80 text-white p-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap"
        onClick={() => handleSocialLogin('google')}
      >
        <i className="fab fa-google"></i>
      </button>
      <button
        type="button"
        className="flex justify-center items-center bg-[#2D3748]/50 hover:bg-[#2D3748]/80 text-white p-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap"
        onClick={() => handleSocialLogin('facebook')}
      >
        <i className="fab fa-facebook-f"></i>
      </button>
      <button
        type="button"
        className="flex justify-center items-center bg-[#2D3748]/50 hover:bg-[#2D3748]/80 text-white p-3 rounded-lg transition-all cursor-pointer !rounded-button whitespace-nowrap"
        onClick={() => handleSocialLogin('apple')}
      >
        <i className="fab fa-apple"></i>
      </button>
    </div>
  );
};

export default SocialLogin;