import {
  createContext,
  useContext,
  useEffect,
  useState,
  newState,
} from "react";
import { socket } from "../shared/services/socketService";
import { getRooms } from "../shared/services/roomService";
import { turnOnDevice } from "../shared/services/arduinoService";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  console.log("ROOMS FROM CONTEXT:", rooms);

  const resetRooms = () => {
    setRooms([]);
  };

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      console.log("DATA GATHERED:", data);
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchRooms();

    const handleNewRoom = (room) => {
      setRooms((prev) => {
        const exists = prev.some((r) => r._id === room._id);
        if (exists) return prev;
        return [...prev, room];
      });
    };

    const handleRoomDeleted = (data) => {
      setRooms((prev) => prev.filter((room) => room._id !== data.roomId));
    };

    const handleRoomUpdated = (data) => {
      console.log("ROOM UPDATED:", data);

      setRooms((prev) => {
        let updated = false;

        const next = prev.map((room) => {
          const sameRoom = String(room._id) === String(data.roomId);

          if (!sameRoom) return room;

          updated = true;

          if (data.people_count >= 1) {
            console.log("TURNING ON DEVICES FOR ROOM:", data.roomId);
            turnOnDevice({ command: "ALL_ON" });
          } else {
            console.log("TURNING OFF DEVICES FOR ROOM:", data.roomId);
            turnOnDevice({ command: "ALL_OFF" });
          }

          return {
            ...room,
            people_count: data.people_count,
          };
        });

        if (!updated) {
          console.warn("⚠️ Room not found for update:", data.roomId);
        }

        console.log("UPDATED ROOMS STATE:", next);

        return next;
      });
    };

    socket.on("roomAdded", handleNewRoom);
    socket.on("roomDeleted", handleRoomDeleted);
    socket.on("roomUpdated", handleRoomUpdated);

    return () => {
      socket.off("roomAdded", handleNewRoom);
      socket.off("roomDeleted", handleRoomDeleted);
      socket.off("roomUpdated", handleRoomUpdated);
    };
  }, []);

  return (
    <RoomContext.Provider value={{ rooms, setRooms, fetchRooms, resetRooms }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => useContext(RoomContext);
