export default function CometSkeleton({ cometSessions = [] }) {
  const count = cometSessions.length || 12;
  return (
    <div className="flex flex-1 w-[90%] mx-auto rounded-2xl p-4 bg-white overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(375px,1fr))] w-full gap-4 justify-items-center content-start items-start">
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i}
            className="w-full rounded-2xl overflow-hidden bg-[#F1F0FE] animate-pulse shadow-sm h-[330px] flex items-end p-2" >
            <div className="p-3 space-y-2 bg-white w-full rounded">
              <div className="h-8 bg-[#F1F0FE] rounded-4xl w-[100px] relative overflow-hidden">
                  <div className="bg-white1 w-full h-full absolute top-0 shimmer-animation"></div>
              </div>
              <div className="h-[60px] bg-[#F1F0FE] rounded-2xl w-full relative overflow-hidden">
                <div className="bg-white1 w-full h-full absolute top-0 shimmer-animation"></div>
              </div>
              <div className="h-8 bg-[#F1F0FE] rounded-4xl w-2/3 relative overflow-hidden">
                <div className="bg-white1 w-full h-full absolute top-0 shimmer-animation"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}