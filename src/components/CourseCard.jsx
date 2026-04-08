import { useAppContext } from '../context/AppContext';

const CourseCard = ({ course, actionButton, isConflict = false }) => {
  const { registeredCourses } = useAppContext();
  
  const isRegistered = registeredCourses.some((c) => c.id === course.id);

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 transition-all duration-300 card-hover ${
        isConflict ? 'border-2 border-red-500 bg-red-50/50' : 'border border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-1">{course.courseName}</h3>
          <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{course.courseCode}</p>
        </div>
        <span className="shrink-0 self-start bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md whitespace-nowrap">
          {course.credits} Credits
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-lg">👨‍🏫</span>
          <span className="text-sm">{course.instructor}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-lg">📅</span>
          <span className="text-sm font-medium">{course.day}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-lg">⏰</span>
          <span className="text-sm">
            {course.startTime} - {course.endTime}
          </span>
        </div>
      </div>

      {isConflict && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm font-medium shadow-sm">
          ⚠️ Time conflict with your schedule
        </div>
      )}

      {isRegistered && !actionButton && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm font-semibold text-center shadow-sm">
          ✓ Registered
        </div>
      )}

      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default CourseCard;
