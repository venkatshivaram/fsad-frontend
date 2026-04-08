import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import CourseCard from '../../components/CourseCard';
import { useAppContext } from '../../context/AppContext';
import { checkTimeConflict } from '../../utils/checkTimeConflict';

const Courses = () => {
  const { courseList, registeredCourses, registerCourse, dropRequests, registrationRequests, waitlistRequests = [], requestDrop, showToast, refreshStudentData, currentUser } =
    useAppContext();

  const getPendingDrop = (courseId) =>
    dropRequests.find((r) => r.course.id === courseId && r.status === 'pending');
    
  const getPendingRegistration = (courseId) =>
    registrationRequests.find((r) => r.course.id === courseId && r.status === 'pending');
    
  const getPendingWaitlist = (courseId) =>
    waitlistRequests.find((r) => r.course.id === courseId);
    
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('All');

  useEffect(() => {
    if (currentUser?.id) {
      refreshStudentData(currentUser.id);
    }
  }, [currentUser?.id]);

  const normalizeText = (value) => String(value || '').trim().toLowerCase();
  const normalizeDay = (value) => {
    const day = normalizeText(value);
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

  // Filter courses
  const filteredCourses = useMemo(() => courseList.filter((course) => {
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedDay = normalizeDay(course.day);
    const selectedDay = normalizeDay(filterDay);

    const matchesSearch =
      !normalizedSearch ||
      normalizeText(course.courseName).includes(normalizedSearch) ||
      normalizeText(course.courseCode).includes(normalizedSearch) ||
      normalizeText(course.instructor).includes(normalizedSearch);

    const matchesDay = selectedDay === 'all' || normalizedDay === selectedDay;

    return matchesSearch && matchesDay;
  }), [courseList, searchTerm, filterDay]);

  const handleRegister = (course) => {
    // Check if already registered or requested
    if (registeredCourses.some((c) => c.id === course.id)) {
      showToast('You are already registered for this course', 'error');
      return;
    }
    if (getPendingRegistration(course.id)) {
      showToast('Registration is already pending', 'info');
      return;
    }
    if (getPendingWaitlist(course.id)) {
      showToast('You are already on the waitlist for this course', 'info');
      return;
    }

    // Check for time conflicts
    const { hasConflict, conflictingCourse } = checkTimeConflict(
      registeredCourses,
      course
    );

    if (hasConflict) {
      showToast(
        `Time conflict with ${conflictingCourse.courseCode} on ${conflictingCourse.day}`,
        'error'
      );
      return;
    }

    // Register the course
    registerCourse(course);
  };

  // Check if course has conflict (for highlighting)
  const hasConflict = (course) => {
    if (registeredCourses.some((c) => c.id === course.id)) {
      return false; // Already registered
    }
    return checkTimeConflict(registeredCourses, course).hasConflict;
  };

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Browse Courses
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Search by name, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Day
              </label>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isRegistered = registeredCourses.some(
              (c) => c.id === course.id
            );
            const isConflict = hasConflict(course);

            const pendingDrop = getPendingDrop(course.id);
            const pendingReg = getPendingRegistration(course.id);
            const pendingWaitlist = getPendingWaitlist(course.id);
            
            const isFull = course.enrolledCount >= course.capacity;

            let buttonClass = isConflict
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : isFull
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white';

            let buttonText = isConflict 
              ? 'Conflict' 
              : isFull 
              ? '📝 Join Waitlist' 
              : 'Request Registration';
            
            return (
              <CourseCard
                key={course.id}
                course={course}
                isConflict={isConflict}
                actionButton={
                  isRegistered ? (
                    pendingDrop ? (
                      <button disabled className="w-full py-2 flex items-center justify-center gap-2 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed text-sm">
                        <span className="animate-spin">⏳</span> Drop Requested
                      </button>
                    ) : (
                      <button
                        onClick={() => requestDrop(course)}
                        className="w-full py-2 rounded-xl font-bold border border-red-200 text-red-600 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all text-sm"
                      >
                        Request Drop
                      </button>
                    )
                  ) : pendingReg ? (
                    <button disabled className="w-full py-2 flex items-center justify-center gap-2 rounded-xl font-bold bg-blue-50 text-blue-600 border border-blue-200 cursor-not-allowed text-sm">
                      <span className="animate-spin">⏳</span> Registration Pending
                    </button>
                  ) : pendingWaitlist ? (
                    <button disabled className="w-full py-2 flex items-center justify-center gap-2 rounded-xl font-bold bg-purple-50 text-purple-600 border border-purple-200 cursor-not-allowed text-sm">
                      <span>🎟️</span> On Waitlist
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(course)}
                      disabled={isConflict}
                      className={`w-full py-2 rounded-xl font-bold shadow-sm transition-all focus:scale-95 text-sm ${buttonClass}`}
                    >
                      {buttonText}
                      {isFull && !isConflict && (
                        <span className="block text-[10px] font-medium opacity-80 mt-0.5">Course is full ({course.capacity}/{course.capacity})</span>
                      )}
                      {!isFull && !isConflict && (
                        <span className="block text-[10px] font-medium opacity-80 mt-0.5">Seats: {course.capacity - (course.enrolledCount || 0)} available</span>
                      )}
                    </button>
                  )
                }
              />
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              No courses found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
