import React from "react";

const SecondaryLogo = ({ size = 40, className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full bg-primary rounded-xl flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">K</span>
      </div>
    </div>
  );
};

export default SecondaryLogo;
