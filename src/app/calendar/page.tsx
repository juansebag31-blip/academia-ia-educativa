import { StudyCalendar } from "@/components/study-calendar";
import { courseSeed } from "@/lib/course-seed";

export default function CalendarPage() {
  return <StudyCalendar course={courseSeed} />;
}
