import React, { useState, useEffect, useRef } from "react";
import { useActivity } from "../../context/activityContext";
import UnderConstruction from "@/assets/images/under_construction.png";
import sortDown from "@/assets/icons/sortDown.png";
import sortUp from "@/assets/icons/sortUp.png";
import { listActivity } from "../../shared/services/activityService";
import { useRooms } from "../../context/roomContext";

export default function ActivityPage() {
  const [selectedButton, setSelectedButton] = useState(0);
  const [displayedCounts, setDisplayedCounts] = useState({
    0: 10,
    1: 10,
    2: 10,
  });
  const scrollContainerRef = useRef(null);
  const { getActivitiesByDate } = useActivity();
  const buttons = ["Today", "This Week", "This Month"];
  const [sortAsc, setSortAsc] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { rooms } = useRooms();

  const filterMap = {
    0: "today",
    1: "week",
    2: "month",
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!rooms || rooms.length === 0) return;

        console.log("Rooms in ActivityPage:", rooms);

        const res = await listActivity(rooms[0]._id);
        console.log("Fetched activities:", res);

        setActivities(res);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [rooms]);

  const filteredActivities = activities
    .filter((activity) => {
      const activityDate = new Date(activity.activity_timestamp);
      const now = new Date();

      if (selectedButton === 0) {
        return activityDate.toDateString() === now.toDateString();
      }

      if (selectedButton === 1) {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return activityDate >= weekAgo;
      }

      if (selectedButton === 2) {
        return (
          activityDate.getMonth() === now.getMonth() &&
          activityDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    })
    .slice()
    .sort((a, b) =>
      sortAsc
        ? new Date(a.activity_timestamp) - new Date(b.activity_timestamp)
        : new Date(b.activity_timestamp) - new Date(a.activity_timestamp),
    );

  const currentDisplayCount = displayedCounts[selectedButton];
  const displayedActivities = filteredActivities.slice(0, currentDisplayCount);
  const hasMoreActivities = filteredActivities.length > currentDisplayCount;

  const handleLoadMore = () => {
    setDisplayedCounts((prev) => ({
      ...prev,
      [selectedButton]: prev[selectedButton] + 10,
    }));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderActivityMessage = (activity) => {
    // Handle old message format for backward compatibility
    if (activity.activity_message) {
      const message = activity.activity_message;

      // Match patterns like: Lights in "classroom 3" have been turned on
      const deviceMatch = message.match(/(Lights|Fans)/i);
      const roomMatch = message.match(/["']([^"']+)["']/);

      if (deviceMatch && roomMatch) {
        const device = deviceMatch[1].toLowerCase();
        const room = roomMatch[1];

        if (message.toLowerCase().includes("turned on")) {
          return (
            <span>
              <span className="font-bold">{room}</span>
              {` ${device} turned on`}
            </span>
          );
        } else if (message.toLowerCase().includes("turned off")) {
          return (
            <span>
              <span className="font-bold">{room}</span>
              {` ${device} turned off`}
            </span>
          );
        }
      }

      const roomCreationMatch = message.match(
        /classroom\s+["']([^"']+)["']\s+(has been created|has been removed)/i,
      );
      if (roomCreationMatch) {
        const room = roomCreationMatch[1];
        const action = roomCreationMatch[2].toLowerCase();

        return (
          <span>
            <span className="font-bold">{room}</span>
            {` ${action}`}
          </span>
        );
      }

      // Improved fallback: Try to extract room name from quoted strings or after "in"
      let extractedRoom = "";
      if (roomMatch) {
        extractedRoom = roomMatch[1];
      } else {
        // Try to extract room after "in" keyword
        const inMatch = message.match(/in\s+(.+?)(?:\s+(?:lights|fans|have|turned|has|been))/i);
        if (inMatch) {
          extractedRoom = inMatch[1].replace(/^["']|["']$/g, "").trim();
        }
      }

      if (extractedRoom) {
        const cleanedMessage = message.replace(new RegExp(extractedRoom, "i"), "").trim();
        return (
          <span>
            <span className="font-bold">{extractedRoom}</span>
            {cleanedMessage && ` ${cleanedMessage}`}
          </span>
        );
      }

      return <span>{message}</span>;
    }

    const { roomName, action, target } = activity;

    let actionText = "";
    if (action === "created") {
      actionText = " has been created";
    } else if (action === "removed") {
      actionText = " has been removed";
    } else if (action === "turned_on" || action === "turned_off") {
      const targetName = target ? target.toLowerCase() : "device";
      const onOff = action === "turned_on" ? "turned on" : "turned off";
      actionText = ` ${targetName} ${onOff}`;
    }

    return (
      <span>
        <span className="font-bold">{roomName}</span>
        {actionText}
      </span>
    );
  };
  
  return (
    <div className="w-full h-full bg-[#E4E3E1] min-h-0">
      <section className="relative w-full h-full flex flex-col gap-6 min-h-0">
        <div className="w-full flex flex-row items-end justify-between text-[#1E1E1E] opacity-75">
          <h1 className="text-subheader font-bold">Activity Log</h1>
          {/* <button 
            onClick={() => setSortAsc(prev => !prev)}
            className="flex items-center gap-2 w-auto h-10 bg-transparent text-[#1E1E1E] px-12 rounded-lg text-2xl font-semibold hover:bg-[#d4d3d1] transition-colors duration-300"
          >
            <img src={sortAsc ? sortUp : sortDown} alt="Sort" className="w-10 h-6" />
            Sort
          </button> */}
        </div>
        <div className="w-full h-full min-h-0 rounded-2xl shadow-outside-dropshadow flex flex-col bg-[#shadow-black/40 hover:shadow-md]">
          <div className="w-full h-[15%] shadow-lg shadow-gray px-5 py-3">
            <div className="w-full h-full p-4 flex flex-row justify-between gap-5 rounded-xl shadow-inside-dropshadow-small">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedButton(index)}
                  className={`w-full text-subtitle px-5 primary-text rounded-lg cursor-pointer hover:scale-101 transition-transform duration-300
            ${selectedButton === index ? "shadow-black/40 shadow-md" : ""}
          `}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-full p-5 flex flex-col min-h-0">
            {/* Activity Log */}
            <div
              ref={scrollContainerRef}
              className="w-full h-full overflow-y-scroll rounded-xl shadow-inside-dropshadow-small flex flex-col"
            >
              {filteredActivities.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-subtitle text-[#999] font-light">
                    No activities for {buttons[selectedButton].toLowerCase()}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    {displayedActivities.map((activity) => (
                      <div
                        key={activity._id}
                        className="w-full border-b border-gray-300 p-5 primary-text flex flex-row items-center justify-between hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-subtitle text-[#4F4F4F]">
                            {renderActivityMessage(activity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(activity.activity_timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasMoreActivities && (
                    <div className="w-full p-4 flex justify-center border-t border-gray-300">
                      <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 bg-transparent text-[#A7A7A4] rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
