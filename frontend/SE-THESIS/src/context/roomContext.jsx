import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../shared/services/socketService";
import { getRooms } from "../shared/services/roomService";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  console.log("ROOMS FROM CONTEXT:", rooms)

  const resetRooms = () => {
    setRooms([]);
  };

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      console.log("DATA GATHERED:", data)
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) return;
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

    socket.on("roomAdded", handleNewRoom);
    socket.on("roomDeleted", handleRoomDeleted);

    return () => {
      socket.off("roomAdded", handleNewRoom);
      socket.off("roomDeleted", handleRoomDeleted);
    };
  }, []);

  return (
    <RoomContext.Provider value={{ rooms, setRooms, fetchRooms, resetRooms }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => useContext(RoomContext);
