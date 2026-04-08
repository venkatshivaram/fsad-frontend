import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const normalizeDay = (value) => {
  const day = String(value || '').trim().toLowerCase();
  const dayMap = {
    mon: 'monday',
    monday: 'monday',
    tue: 'tuesday',
    tues: 'tuesday',
    tuesday: 'tuesday',
    wed: 'wednesday',
    wednesday: 'wednesday',
    thu: 'thursday',
    thur: 'thursday',
    thurs: 'thursday',
    thursday: 'thursday',
    fri: 'friday',
    friday: 'friday'
  };

  return dayMap[day] || day;
};

const parseTime = (value) => {
  if (!value) return null;

  const raw = String(value).trim().toUpperCase();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  } else if (!meridiem && hours > 0 && hours < 8) {
    // Existing data appears to store some afternoon times like 03:50 instead of 15:50.
    hours += 12;
  }

  return (hours * 60) + minutes;
};

const formatMinutes = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const buildTimeSlots = (courses) => {
  const parsedCourses = courses
    .map((course) => ({
      ...course,
      normalizedDay: normalizeDay(course.day),
      parsedStart: parseTime(course.startTime),
      parsedEnd: parseTime(course.endTime)
    }))
    .filter((course) => course.normalizedDay && course.parsedStart != null && course.parsedEnd != null);

  if (parsedCourses.length === 0) {
    return {
      parsedCourses,
      timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    };
  }

  const earliestHour = Math.min(...parsedCourses.map((course) => Math.floor(course.parsedStart / 60)));
  const latestHour = Math.max(...parsedCourses.map((course) => Math.ceil(course.parsedEnd / 60)));

  const startHour = Math.min(earliestHour, 9);
  const endHour = Math.max(latestHour, 17);
  const timeSlots = [];

  for (let hour = startHour; hour <= endHour; hour += 1) {
    timeSlots.push(formatMinutes(hour * 60));
  }

  return { parsedCourses, timeSlots };
};

const ScheduleGrid = () => {
  const { registeredCourses } = useAppContext();

  const { parsedCourses, timeSlots } = useMemo(
    () => buildTimeSlots(registeredCourses),
    [registeredCourses]
  );

  const getCourseForSlot = (day, time) => {
    const normalizedDay = normalizeDay(day);
    const slotMinutes = parseTime(time);

    return parsedCourses.find((course) => {
      if (course.normalizedDay !== normalizedDay) return false;
      return slotMinutes >= course.parsedStart && slotMinutes < course.parsedEnd;
    });
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-slate-700 p-3 text-left font-semibold">Time</th>
              {days.map((day) => (
                <th key={day} className="border border-slate-700 p-3 text-center font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time} className="hover:bg-slate-50">
                <td className="border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-700">
                  {time}
                </td>
                {days.map((day) => {
                  const course = getCourseForSlot(day, time);

                  return (
                    <td
                      key={`${day}-${time}`}
                      className={`border border-slate-200 p-3 align-top ${course ? 'bg-blue-50' : ''}`}
                    >
                      {course && (
                        <div className="text-sm">
                          <div className="font-bold text-blue-900">{course.courseCode}</div>
                          <div className="mt-1 text-xs text-slate-600">{course.courseName}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {formatMinutes(course.parsedStart)} - {formatMinutes(course.parsedEnd)}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleGrid;
