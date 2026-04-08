import { useEffect } from 'react';
import Layout from '../../components/Layout';
import ScheduleGrid from '../../components/ScheduleGrid';
import { useAppContext } from '../../context/AppContext';

const formatTime = (value) => {
  if (!value) return '';

  const raw = String(value).trim().toUpperCase();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/);
  if (!match) return raw;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const Schedule = () => {
  const { registeredCourses, dropRequests, requestDrop, refreshStudentData, currentUser } = useAppContext();

  useEffect(() => {
    if (currentUser?.id) {
      refreshStudentData(currentUser.id);
    }
  }, [currentUser?.id, refreshStudentData]);

  const getPendingDrop = (courseId) =>
    dropRequests.find((r) => r.course?.id === courseId && r.status === 'pending');

  const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">My Schedule</h1>
          <div className="flex items-center gap-3">
            {registeredCourses.length > 0 && (
              <button
                onClick={() => window.print()}
                className="no-print flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg active:scale-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            )}
            <div className="rounded-lg bg-blue-100 px-6 py-3 font-semibold text-blue-800">
              Total Credits: {totalCredits}
            </div>
          </div>
        </div>

        {registeredCourses.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-6xl">Schedule</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">No Courses Yet</h2>
            <p className="mb-6 text-slate-600">You have not registered for any courses yet.</p>
            <a
              href="/student/courses"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <ScheduleGrid />
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-slate-800">Registered Courses</h2>
              <div className="space-y-3">
                {registeredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">{course.courseCode}</span>
                        <span className="text-slate-700">{course.courseName}</span>
                        <span className="rounded bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-700">
                          {course.credits} Credits
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">{course.day}</span> |{' '}
                        {formatTime(course.startTime)} - {formatTime(course.endTime)} |{' '}
                        {course.instructor}
                      </div>
                    </div>
                    {getPendingDrop(course.id) ? (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700"
                      >
                        Drop Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => requestDrop(course)}
                        className="rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Request Drop
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
