import React, { useState, useEffect } from "react";
import UnderConstruction from "@/assets/images/under_construction.png";
import { getPendingApplications, approveApplication, rejectApplication, getNotifications } from "@/shared/services/organization";
import { getPendingClassroomRequests, approveClassroomRequest, rejectClassroomRequest } from "@/shared/services/classroomRequestService";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";
import Popover from "@mui/material/Popover";
import notifPing from "@/assets/icons/notifPing.png";
import Accept from "@/assets/icons/Accept.png";
import Reject from "@/assets/icons/Reject.png";

export default function NotificationPage() {
  const { user } = useAuth();
  const [selectedButton, setSelectedButton] = useState(0); // Default to "Today"
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const buttons = ["Today", "Earlier", "This Week"];
  const [classroomRequests, setClassroomRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.user_organization) {
          const [appsData, notifsData, classroomReqsData] = await Promise.all([
            getPendingApplications(),
            getNotifications(),
            user?.is_admin ? getPendingClassroomRequests() : Promise.resolve({ requests: [] }),
          ]);
          setApplications(appsData.applications || []);
          setNotifications(notifsData.notifications || []);
          setClassroomRequests(classroomReqsData.requests || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getDateCategory = (dateString) => {
    if (!dateString) return "earlier";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays < 7) return "week";
    return "earlier";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getFilteredItems = () => {
    const selectedCategory = buttons[selectedButton].toLowerCase();
    let categoryMap = {
      today: "today",
      earlier: "earlier",
      "this week": "week",
    };
    const category = categoryMap[selectedCategory];

    let allItems = [];
    
    // Only include applications if user is admin
    if (user?.is_admin) {
      allItems.push(...applications.map((app) => ({
        ...app,
        type: "application",
        dateField: app.applied_at,
      })));
      
      // Include classroom requests if user is admin
      allItems.push(...classroomRequests.map((req) => ({
        ...req,
        type: "classroom_request",
        dateField: req.created_at,
      })));
    }
    
    allItems.push(...notifications.map((notif) => ({
      ...notif,
      type: "notification",
      dateField: notif.created_at,
    })));

    return allItems.filter((item) => {
      const itemCategory = getDateCategory(item.dateField);
      if (category === "today") return itemCategory === "today";
      if (category === "earlier") return itemCategory === "earlier";
      if (category === "week") return itemCategory === "week" || itemCategory === "today";
      return true;
    });
  };

  const handleActionClick = (event, app, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
    setActionType(type);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedApp?._id) return;
    try {
      setIsProcessing(true);
      
      if (selectedApp.type === "classroom_request") {
        // Handle classroom request
        if (actionType === "approve") {
          await approveClassroomRequest(selectedApp._id);
          toast.success(`Classroom request for "${selectedApp.classroom_name}" has been approved!`);
        } else {
          await rejectClassroomRequest(selectedApp._id);
          toast.success(`Classroom request for "${selectedApp.classroom_name}" has been rejected.`);
        }
      } else {
        // Handle application
        if (actionType === "approve") {
          await approveApplication(selectedApp._id);
          toast.success(`${selectedApp.first_name} ${selectedApp.last_name} has been approved!`);
        } else {
          await rejectApplication(selectedApp._id);
          toast.success(`${selectedApp.first_name} ${selectedApp.last_name} has been rejected.`);
        }
      }

      // Refresh all data
      const refreshPromises = [
        getPendingApplications(),
        getNotifications(),
      ];
      if (user?.is_admin) {
        refreshPromises.push(getPendingClassroomRequests());
      }
      
      const [appsData, notifsData, classroomReqsData] = await Promise.all(refreshPromises);
      setApplications(appsData.applications || []);
      setNotifications(notifsData.notifications || []);
      if (classroomReqsData?.requests) {
        setClassroomRequests(classroomReqsData.requests);
      }
      handleClose();
    } catch (err) {
      console.error("Error processing action:", err);
      toast.error("Failed to process request");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = getFilteredItems();
  const open = Boolean(anchorEl);
  const id = open ? "action-popover" : undefined;

  return (
    <div className="w-full h-full bg-[#E4E3E1] min-h-0">
      <section className="relative w-full h-full flex flex-col gap-6 min-h-0">
        <div className="w-full flex flex-row items-end justify-between text-[#1E1E1E] opacity-75">
          <h1 className="text-subheader font-bold">Notifications</h1>
        </div>
        <div className="w-full h-full min-h-0 rounded-2xl shadow-outside-dropshadow flex flex-col bg-[#E4E3E1] p-4 gap-2">
          <div className="w-full h-[10%] p-4 flex flex-row justify-around items-center rounded-xl shadow-inside-dropshadow-small">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => setSelectedButton(index)}
                className={`text-subtitle px-45 py-2 primary-text rounded-lg cursor-pointer hover:scale-101 transition-transform duration-300 ${
                  selectedButton === index ? "shadow-black/40 shadow-md" : ""
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-[#E4E3E1] border border-[#d4d3d1] rounded-xl shadow-inside-dropshadow-small overflow-y-auto">
            <div className="w-full h-16 bg-[#E4E3E1] border-b border-[#d4d3d1] flex items-center shadow-inside-dropshadow-small px-4 gap-4 sticky top-0">
              <div className="flex flex-row items-center justify-around w-full gap-4">
                <span className="text-base font-semibold w-auto">Notification</span>
                <span className="text-base font-semibold w-32 text-right">Time</span>
                <span className="text-base font-semibold w-24"></span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32 text-[#1E1E1E]">
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32 text-red-500">
                <span>{error}</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[#1E1E1E] opacity-50">
                <span>No notifications</span>
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full h-16 border-b border-[#d4d3d1] flex items-center justify-around px-4 gap-4 hover:bg-[#d4d3d1] transition-colors"
                >
                  <div className="flex flex-row items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-3 w-auto">
                      <img src={notifPing} alt="Notification" className="w-5 h-5" />
                      <span className="text-base">
                        {item.type === "application"
                          ? `${item.first_name} ${item.last_name} applied to your organization`
                          : item.type === "classroom_request"
                          ? `${item.requested_by_name} is requesting to add a classroom: "${item.classroom_name}"`
                          : item.message}
                      </span>
                    </div>
                    <span className="text-base text-[#666] w-20 absolute right-169 text-left">
                      {formatDate(item.dateField)}
                    </span>
                    <div className="flex items-center gap-2 w-24 justify-end">
                      {(item.type === "application" || item.type === "classroom_request") && (
                        <>
                          <button
                            onClick={(e) => handleActionClick(e, item, "approve")}
                            className="p-1 hover:bg-[#A7A7A3] rounded transition-colors"
                            title="Approve"
                          >
                            <img src={Accept} alt="Accept" className="w-8 h-8" />
                          </button>
                          <button
                            onClick={(e) => handleActionClick(e, item, "reject")}
                            className="p-1 hover:bg-[#A7A7A3] rounded transition-colors"
                            title="Reject"
                          >
                            <img src={Reject} alt="Reject" className="w-8 h-8" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#DFDEDA",
              borderRadius: "15px",
              marginY: -2,
            },
          },
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <div className="w-96 rounded-lg flex flex-col gap-4 p-5 bg-[#DFDEDA]">
          <h2 className="text-lg font-semibold text-[#4F4F4F]">
            {actionType === "approve" ? "Approve Request" : "Reject Request"}
          </h2>
          <p className="text-base text-[#4F4F4F]">
            {selectedApp?.type === "classroom_request"
              ? actionType === "approve"
                ? `Are you sure you want to approve the classroom request "${selectedApp?.classroom_name}" from ${selectedApp?.requested_by_name}?`
                : `Are you sure you want to reject the classroom request "${selectedApp?.classroom_name}" from ${selectedApp?.requested_by_name}?`
              : actionType === "approve"
              ? `Are you sure you want to approve ${selectedApp?.first_name} ${selectedApp?.last_name}?`
              : `Are you sure you want to reject ${selectedApp?.first_name} ${selectedApp?.last_name}?`}
          </p>
          <div className="flex flex-row gap-3 justify-end">
            <button
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className="px-6 py-2 bg-[#A1A2A6] text-white rounded-lg text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </button>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-2 bg-[#A1A2A6] text-white rounded-lg text-base hover:bg-[#7E808C] transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>         
          </div>
        </div>
      </Popover>
    </div>
  );
}
