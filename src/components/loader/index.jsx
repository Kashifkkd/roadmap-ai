import React from "react";
import Image from "next/image";

import LoaderSteps from "./LoaderSteps";

const ProgressbarLoader = () => {
  const estimatedTimeRemaining = 4;
  return (
    <>
      <div className="w-screen h-screen flex flex-col bg-[#F1F0FE] gap-2 p-2 sm:p-3 md:p-4">
        {/* <Header /> */}
        {/* second part */}
        <div className="flex flex-col w-full h-full p-2 sm:p-3 md:p-4 rounded-2xl gap-2 bg-white">
          <div className="w-full h-full flex flex-col items-center rounded-lg px-2 sm:px-4 md:px-6 gap-2.5 border border-[#C7C2F9] overflow-y-auto">
            <div className="flex flex-col w-full sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-2/5 h-full justify-between pt-4 sm:pt-5 md:pt-6 pb-4">
              <div className="flex w-full items-center justify-center flex-col pt-1 gap-2 sm:gap-3">
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                  <Image
                    src="/logo2.svg"
                    alt="Kyper Logo"
                    width={70}
                    height={70}
                    className="rounded-full animate-spin w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                    style={{
                      animation: "spin 8s linear infinite",
                    }}
                  />
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif leading-tight sm:leading-6 text-primary-900 text-center px-2">
                    Creating your Comet
                  </h3>
                  <p className="text-sm sm:text-base font-medium leading-5 sm:leading-6 text-primary-900 text-center px-2 sm:px-4">
                    Our AI agents are working together to build your learning
                    experience
                  </p>
                </div>
                {/* <Header /> */}
                {/* <LoaderHeader /> */}
                <LoaderSteps />
              </div>
              <div className="flex rounded-tr-4xl w-full sm:w-5/6 md:w-1/2 justify-center mx-auto rounded-tl-4xl py-2 px-4 sm:py-2.5 sm:px-6 md:px-4 bg-[#7367F0] mt-4 sm:mt-6">
                <span className="font-inter font-semibold text-xs sm:text-sm md:text-xs leading-5 text-white text-center">
                  Estimated time remaining: {estimatedTimeRemaining} minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressbarLoader;
