import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import User from "@/assets/icons/user.png";
import Search from "@/assets/icons/search.png";
import { useAuth } from "@/context/authContext";
import { useRooms } from "@/context/roomContext";
import { useActivity } from "@/context/activityContext";
import { getNotifications, getOrganizationMembers } from "@/shared/services/organization";

const SEARCH_ROUTES = [
  { label: "Dashboard", keywords: ["dashboard", "monitor", "overview", "home", "main"], path: "/iris/home", type: "page" },
  { label: "Room Management", keywords: ["classroom", "monitor classroom", "rooms", "classes", "classroom monitor"], path: "/iris/room_management", type: "page" },
  { label: "Activities", keywords: ["activity", "activities", "logs", "records", "events"], path: "/iris/activity", type: "page" },
  { label: "Organization", keywords: ["organization", "org", "company", "team", "organization page"], path: "/iris/organization", type: "page" },
  { label: "Profile", keywords: ["profile", "account", "settings", "user", "my profile"], path: "/iris/profile", type: "page" },
  { label: "Notifications", keywords: ["notifications", "alerts", "messages", "notify", "notification"], path: "/iris/notifications", type: "page" },
  { label: "Development", keywords: ["development", "dev", "development page"], path: "/iris/development", type: "page" },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms } = useRooms();
  const { activities } = useActivity();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [dbData, setDbData] = useState({ members: [], notifications: [] });
  const searchRef = useRef(null);

  // Fetch database items on component mount
  useEffect(() => {
    const fetchDbData = async () => {
      try {
        const [notifsData, membersData] = await Promise.all([
          getNotifications(),
          user?.user_organization ? getOrganizationMembers(user.user_organization) : Promise.resolve(null),
        ]);
        setDbData({
          notifications: notifsData.notifications || [],
          members: membersData?.members || [],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user) {
      fetchDbData();
    }
  }, [user]);

  const handleProfileClick = () => {
    navigate("/iris/profile");
  };

  const handleSearch = (value) => {
    setSearchInput(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const query = value.toLowerCase();
    const results = [];

    // Search page routes
    const pageResults = SEARCH_ROUTES.filter((route) =>
      route.keywords.some((keyword) => keyword.includes(query) || query.includes(keyword))
    ).map((route) => ({
      ...route,
      searchType: "page",
    }));

    results.push(...pageResults);

    // Search classrooms (rooms)
    const classroomResults = rooms
      .filter((room) => room.room_name.toLowerCase().includes(query))
      .map((room) => ({
        label: `${room.room_name}`,
        sublabel: "Classroom",
        path: "/iris/room_management",
        type: "classroom",
        searchType: "database",
      }));

    results.push(...classroomResults);

    // Search activities
    const activityResults = activities
      .filter((activity) =>
        activity.activity_message?.toLowerCase().includes(query) ||
        activity.roomName?.toLowerCase().includes(query) ||
        activity.message?.toLowerCase().includes(query) ||
        activity.room_name?.toLowerCase().includes(query)
      )
      .slice(0, 5) // Limit to 5 results
      .map((activity) => ({
        label: `${activity.roomName || activity.room_name || "Activity"}`,
        sublabel: `Activity: ${(activity.activity_message || activity.message || "")?.substring(0, 30)}...`,
        path: "/iris/activity",
        type: "activity",
        searchType: "database",
      }));

    results.push(...activityResults);

    // Search notifications
    const notificationResults = dbData.notifications
      .filter((notif) =>
        notif.message?.toLowerCase().includes(query)
      )
      .slice(0, 5) // Limit to 5 results
      .map((notif) => ({
        label: `Notification`,
        sublabel: notif.message?.substring(0, 40) + "...",
        path: "/iris/notifications",
        type: "notification",
        searchType: "database",
      }));

    results.push(...notificationResults);

    // Search organization members
    const memberResults = dbData.members
      .filter((member) =>
        member.first_name?.toLowerCase().includes(query) ||
        member.last_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      )
      .slice(0, 5) // Limit to 5 results
      .map((member) => ({
        label: `${member.first_name} ${member.last_name}`,
        sublabel: member.email,
        path: "/iris/organization",
        type: "member",
        searchType: "database",
      }));

    results.push(...memberResults);

    setSearchResults(results);
    setShowResults(true);
  };

  const handleResultClick = (path) => {
    setSearchInput("");
    setSearchResults([]);
    setShowResults(false);
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-16 flex flex-row shadow-outside-dropshadow-small items-center justify-between bg-transparent px-4 ">
      <h1 className="text-subtitle text-[#1E1E1E] opacity-75 font-bold">
        Intelligent Room Interaction System
      </h1>
      <div className="flex flex-row w-[50%] h-full items-center justify-end gap-4">
        <div ref={searchRef} className="relative w-[70%] h-[70%]">
          <div className="w-full h-full bg-[#E4E3E1] text-subtitle rounded-3xl shadow-inside-dropshadow-small flex items-center px-4">
            <img src={Search} alt="Search" className="w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search pages or items..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchInput && setShowResults(true)}
              className="w-full bg-transparent text-[#1e1e1e] font-light text-subtitle outline-none"
            />
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#E4E3E1] shadow-outside-dropshadow rounded-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.path)}
                  className="w-full px-4 py-3 text-left hover:bg-[#D4D3D1] transition-colors duration-150 border-b border-[#D4D3D1] last:border-b-0 flex flex-col"
                >
                  <p className="text-subtitle text-[#1E1E1E] font-medium">{result.label}</p>
                  {result.sublabel && (
                    <p className="text-xs text-[#666] font-light">{result.sublabel}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {showResults && searchInput && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#E4E3E1] shadow-outside-dropshadow rounded-2xl px-4 py-3 z-50">
              <p className="text-subtitle text-[#A1A2A6]">No results found</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleProfileClick}
          className="w-10 aspect-square rounded-full shadow-outside-dropshadow-small flex items-center justify-center bg-[#A1A2A6] cursor-pointer hover:bg-[#b1b1b1] hover:scale-105 transition-transform duration-300">
          <img src={User} alt="Profile" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
