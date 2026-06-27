import MinistryCourses from "./MinistryCourses";
import MinistrySubjects from "./MinistrySubjects";
import { useState } from "react";

const MinistrySubjectsAndCourses = () => {
  const [subjectsRefreshKey, setSubjectsRefreshKey] = useState(0);
  const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);

  return (
    <>
      <MinistrySubjects
        coursesRefreshKey={coursesRefreshKey}
        onSubjectsChanged={() => setSubjectsRefreshKey((key) => key + 1)}
      ></MinistrySubjects>
      <MinistryCourses
        subjectsRefreshKey={subjectsRefreshKey}
        onCoursesChanged={() => setCoursesRefreshKey((key) => key + 1)}
      ></MinistryCourses>
    </>
  );
};
export default MinistrySubjectsAndCourses;
