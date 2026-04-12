import { createContext, useContext, useEffect, useState } from "react";
import { getSubjects } from "../shared/services/subjectService";

const SubjectContext = createContext();

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) return;
    fetchSubjects();
  }, []);

  const addSubjectToList = (subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  const removeSubjectFromList = (subjectId) => {
    setSubjects((prev) => prev.filter((subject) => subject._id !== subjectId));
  };

  return (
    <SubjectContext.Provider value={{ subjects, setSubjects, fetchSubjects, addSubjectToList, removeSubjectFromList }}>
      {children}
    </SubjectContext.Provider>
  );
};

export const useSubjects = () => useContext(SubjectContext);
