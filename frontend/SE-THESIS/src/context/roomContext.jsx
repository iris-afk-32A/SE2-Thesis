import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../shared/services/socketService";
import { getRooms } from "../shared/services/roomService";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRooms();

    const handleNewRoom = (room) => {
      setRooms((prev) => [...prev, room]);
    };

    socket.on("roomAdded", handleNewRoom);

    return () => {
      socket.off("roomAdded", handleNewRoom);
    };
  }, []);

  return (
    <RoomContext.Provider value={{ rooms, setRooms }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => useContext(RoomContext);