import { createContext, useContext, useState } from "react";
import { addSchedule, getSchedulesByRoom } from "../shared/services/scheduleService";

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);

  const fetchSchedulesByRoom = async (roomId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await getSchedulesByRoom(roomId);
      setSchedules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createSchedule = async (scheduleData) => {
    const data = await addSchedule(scheduleData);
    setSchedules((prev) => [...prev, data.schedule]);
    return data;
  };

  return (
    <ScheduleContext.Provider value={{ schedules, fetchSchedulesByRoom, createSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);