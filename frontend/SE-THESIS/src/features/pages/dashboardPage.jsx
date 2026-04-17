// !Libraries
import { useState, useEffect } from "react";
// !Componenets
import { checkFirstTime } from "../../shared/services/authService";
import { socket } from "../../shared/services/socketService.js";
// import { getRooms } from "../../shared/services/roomService.js";
import { useRooms } from "../../context/roomContext.jsx";
import { useCamera } from "../../context/cameraContext.jsx";
import { useActivity } from "../../context/activityContext.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { getDevice } from "../../shared/services/deviceService.js";

export default function dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showGuide, setShowGuide] = useState(false);
  const { rooms, setRooms } = useRooms();
  const { activities } = useActivity();
  const { user } = useAuth();
  const [emptyRooms, setEmptyRooms] = useState(0);
  const [vacantRoom, setVacantRoom] = useState(0);
  const { startCamera, startFrameCapture, initializeRoomCamera } = useCamera();
  const [availableCameras, setAvailableCameras] = useState([]);

  // Check if user is authorized and admin
  const canViewActivities = user?.is_authorized || user?.is_admin;

  useEffect(() => {
    console.log("DASHBOARD ROOMS UPDATED:", rooms);
  }, [rooms]);

  // Filter activities to only show those from rooms in the same organization
  const filteredActivities = canViewActivities
    ? activities.filter((activity) => {
        const room = rooms.find((r) => r.room_name === activity.roomName);
        return room && room.room_organization === user.user_organization;
      })
    : [];

  // Get 5 most recent activities
  const recentActivities = filteredActivities.slice(0, 5);

  useEffect(() => {
    setEmptyRooms(rooms.filter((room) => (room.people_count ?? 0) > 0).length);
    setVacantRoom(
      rooms.filter((room) => (room.people_count ?? 0) === 0).length,
    );
  }, [rooms]);

  const renderActivityMessage = (activity) => {
    // Handle old message format for backward compatibility
    if (activity.message) {
      // Match patterns like: Fans in "classroom 3" have been turned on
      const deviceMatch = activity.message.match(/(Fans|Lights)/i);
      const roomMatch = activity.message.match(/["']([^"']+)["']/);
      const actionMatch = activity.message.match(
        /(turned on|turned off|have been turned on|have been turned off)/i,
      );

      if (deviceMatch && roomMatch && actionMatch) {
        const device = deviceMatch[1].toLowerCase();
        const room = roomMatch[1];
        const action = actionMatch[1].replace("have been ", "").toLowerCase();

        return (
          <span>
            <span className="font-bold">{room}</span>
            {` ${device} ${action}`}
          </span>
        );
      }

      // Fallback for old room creation/deletion format
      const cleanedMessage = activity.message
        .replace(/Classroom\s+["']([^"']+)["']\s*/i, "")
        .trim();

      const roomName = roomMatch ? roomMatch[1] : "";

      return (
        <span>
          <span className="font-bold">{roomName}</span>
          {cleanedMessage && ` ${cleanedMessage}`}
        </span>
      );
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

  useEffect(() => {
    console.log("Setting up socket listeners. Current state:", {
      socketId: socket.id,
      connected: socket.connected,
      url: import.meta.env.VITE_SERVER_URL,
    });

    const handleConnect = () => console.log("Socket connected!", socket.id);
    const handleError = (error) => console.error("Socket error:", error);
    const handleDisconnect = (reason) =>
      console.log("Socket disconnected:", reason);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    // If already connected, log immediately
    if (socket.connected) {
      console.log("Socket already connected:", socket.id);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
    };
  }, []);

  useEffect(() => {
    const handleDeviceAdded = async ({ device_location }) => {
      await initializeRoomCamera(device_location, rooms, availableCameras);
    };

    socket.on("deviceAdded", handleDeviceAdded);

    return () => {
      socket.off("deviceAdded", handleDeviceAdded);
    };
  }, [rooms, availableCameras, initializeRoomCamera]);

  useEffect(() => {
    if (!rooms.length || !availableCameras.length) return;

    async function initializeAllRoomCameras() {
      try {
        for (const room of rooms) {
          const devices = await getDevice(room._id);

          if (!devices.length) continue;

          const savedDevice = devices[0];

          const matchedCamera = availableCameras.find(
            (cam) => cam.label === savedDevice.device_label,
          );

          if (!matchedCamera) continue;

          await startCamera(room._id, matchedCamera.deviceId);
          startFrameCapture(room._id);
        }
      } catch (err) {
        console.error("Error initializing room cameras:", err);
      }
    }

    socket.on("deviceAdded", initializeAllRoomCameras);
    initializeAllRoomCameras();

    return () => {
      socket.off("deviceAdded", initializeAllRoomCameras);
    };
  }, [rooms, availableCameras, startCamera, startFrameCapture]);

  useEffect(() => {
    async function loadAvailableCameras() {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoInputs = devices.filter(
          (device) => device.kind === "videoinput",
        );

        setAvailableCameras(videoInputs);
        console.log("AVAILABLE CAMERAS:", videoInputs);
      } catch (err) {
        console.error("Error loading available cameras:", err);
      }
    }

    loadAvailableCameras();
  }, []);

  useEffect(() => {
    // getRooms();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Listen for new rooms in real-time
    const handleNewRoom = (room) => setRooms((prev) => [...prev, room]);
    socket.on("roomAdded", handleNewRoom);

    return () => {
      socket.off("roomAdded", handleNewRoom);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#E4E3E1]">
      <style>{`
        .activity-scroll::-webkit-scrollbar {
          width: 30px;
        }
        .activity-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .activity-scroll::-webkit-scrollbar-thumb {
          background: #A7A7A4;
          border-radius: 15px;
          border: 10px solid transparent;
          background-clip: padding-box;
        }
        .activity-scroll::-webkit-scrollbar-thumb:hover {
          background: #999;
          background-clip: padding-box;
        }
      `}</style>
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

        <div className="relative w-full h-[30vh] flex flex-row items-center justify-start gap-6 font-bold">
          <div className="flex flex-col items-start gap-4 primary-text">
            <h2 className="text-title">Occupied Rooms</h2>
            <div className="w-[20vw] aspect-video rounded-2xl shadow-outside-dropshadow flex justify-center items-center text-header">
              {emptyRooms}
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 primary-text">
            <h2 className="text-title">Vacant Rooms</h2>
            <div className="w-[20vw] aspect-video rounded-2xl shadow-outside-dropshadow flex justify-center items-center text-header">
              {vacantRoom}
            </div>
          </div>
          <div className="flex flex-col w-full h-47 items-start gap-4 pad-4 primary-text">
            <h2 className="text-title">Activity History</h2>
            <div className="w-full h-61 rounded-2xl shadow-outside-dropshadow overflow-y-auto p-4 flex flex-col gap-3 pr-6 activity-scroll">
              {!canViewActivities ? (
                <p className="w-full h-full flex items-center justify-center text-subtitle text-[#999] font-light">
                  You don't have permission to view activities
                </p>
              ) : recentActivities.length === 0 ? (
                <p className="w-full h-full flex items-center justify-center text-subtitle text-[#999] font-light">
                  No activities yet
                </p>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-row items-center gap-3 pb-3 border-b border-gray-300 last:border-b-0"
                  >
                    <p className="bg-[#A7A7A4] w-7 aspect-square rounded-full text-center text-[#E4E3E1] font-bold text-lg">
                      !
                    </p>
                    <p>{renderActivityMessage(activity)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="relative w-full h-full flex flex-col gap-4">
          <h1 className="text-title primary-text font-bold">
            Classroom Status
          </h1>
          <div className="w-full h-full rounded-2xl shadow-outside-dropshadow"></div>
        </div>
      </section>
    </div>
  );
}
