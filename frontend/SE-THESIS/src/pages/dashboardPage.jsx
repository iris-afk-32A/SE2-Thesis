import { useState, useEffect } from "react";

export default function dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-[#E4E3E1]">
      <section className="relative w-full h-full flex flex-col gap-6">
        <div className="w-full flex flex-row items-end justify-between text-[#1E1E1E] opacity-75">
          <h1 className="text-subheader font-bold">Dashboard</h1>
          <h2 className="text-subtitle">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            |{" "}
            {currentTime.toLocaleDateString([], {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </h2>
        </div>

        <div className="relative w-full flex flex-row items-center justify-start gap-6 font-bold">
          <div className="flex flex-col items-start gap-4 primary-text">
            <h2 className="text-title">Occupied Rooms</h2>
            <div className="w-[13vw] aspect-square rounded-2xl shadow-outside-dropshadow"></div>
          </div>
          <div className="flex flex-col items-start gap-4 primary-text">
            <h2 className="text-title">Vacant Rooms</h2>
            <div className="w-[13vw] aspect-square rounded-2xl shadow-outside-dropshadow"></div>
          </div>
          <div className="flex flex-col w-full items-start gap-4 primary-text">
            <h2 className="text-title">Activity History</h2>
            <div className="w-full h-[13vw] rounded-2xl shadow-outside-dropshadow"></div>
          </div>
        </div>

        <div className="relative w-full h-full flex flex-col gap-4">
            <h1 className="text-title primary-text font-bold">Classroom Status</h1>
            <div className="w-full h-full rounded-2xl shadow-outside-dropshadow">

            </div>
        </div>
      </section>
    </div>
  );
}
