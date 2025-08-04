import React from 'react';

const AuthBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#00CCFF] to-transparent transform -rotate-12 translate-y-[20vh]"></div>
        <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent transform -rotate-12 translate-y-[40vh]"></div>
        <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#7B42FF] to-transparent transform -rotate-12 translate-y-[60vh]"></div>
      </div>

      <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=abstract%20digital%20particles%20floating%20in%20dark%20space%2C%20tiny%20dots%20of%20light%2C%20futuristic%20tech%20background%2C%20minimal%2C%20elegant%2C%20dark%20navy%20blue%20and%20black%2C%20subtle%20glow%20effects%2C%20depth%20of%20field&width=1440&height=900&seq=particles001&orientation=landscape')] bg-cover opacity-20"></div>

      <div className="absolute bottom-0 right-0 w-[40%] h-[50%] opacity-10">
        <div className="absolute bottom-10 right-10 w-full h-full bg-[url('https://readdy.ai/api/search-image?query=abstract%20silhouette%20of%20a%20chat%20interface%2C%20message%20bubbles%2C%20minimalist%20design%2C%20futuristic%20UI%20elements%2C%20glowing%20edges%2C%20dark%20background%20with%20blue%20accent%2C%20tech%20aesthetic%2C%20blurred%20outlines&width=600&height=600&seq=chatsilhouette001&orientation=squarish')] bg-contain bg-no-repeat bg-right-bottom"></div>
      </div>
    </div>
  );
};

export default AuthBackground;