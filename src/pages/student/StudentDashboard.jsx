import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import ScheduleGrid from '../../components/ScheduleGrid';

const MAX_CREDITS = 30;

const dayColors = {
  Monday:    'bg-blue-500',
  Tuesday:   'bg-violet-500',
  Wednesday: 'bg-emerald-500',
  Thursday:  'bg-amber-500',
  Friday:    'bg-rose-500',
};

const dayShort = { Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI' };

const StudentDashboard = () => {
  const { registeredCourses, courseList, dropRequests, registrationRequests = [], waitlistRequests = [], requestDrop } = useAppContext();
  const navigate = useNavigate();

  // Drop requests for this student
  const myDropRequests = dropRequests.filter((r) => r.status === 'pending');
  const getDropStatus = (courseId) => dropRequests.find((r) => r.course.id === courseId && r.status === 'pending');
  
  const myRegistrationRequests = registrationRequests.filter((r) => r.status === 'pending');
  const myWaitlistRequests = waitlistRequests;

  const totalCredits = registeredCourses.reduce((sum, c) => sum + c.credits, 0);
  const creditPct = Math.min((totalCredits / MAX_CREDITS) * 100, 100);

  const coursesByDay = registeredCourses.reduce((acc, c) => {
    acc[c.day] = (acc[c.day] || 0) + 1;
    return acc;
  }, {});

  const maxDayCount = Math.max(...Object.values(coursesByDay), 1);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl">
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-widest mb-1">CourseCrafter · Student Portal</p>
              <h1 className="text-4xl font-extrabold leading-tight">
                Good day, Student! 👋
              </h1>
              <p className="text-blue-100 mt-2 text-sm">{today}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/student/courses')}
                  className="bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all text-sm"
                >
                  Browse Courses
                </button>
                <button
                  onClick={() => navigate('/student/schedule')}
                  className="bg-white/20 border border-white/40 backdrop-blur text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm"
                >
                  View Schedule
                </button>
              </div>
            </div>

            {/* Credit Gauge */}
            <div className="bg-white/15 backdrop-blur border border-white/30 rounded-2xl p-6 min-w-[180px] text-center shrink-0">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-3">Credit Load</p>
              <div className="relative w-24 h-24 mx-auto">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="white" strokeWidth="3"
                    strokeDasharray={`${creditPct} ${100 - creditPct}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{totalCredits}</span>
                  <span className="text-[10px] text-blue-100 font-medium">/ {MAX_CREDITS}</span>
                </div>
              </div>
              <p className="text-xs text-blue-100 mt-3 font-medium">Credits Registered</p>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Enrolled Subjects', value: registeredCourses.length, sub: 'this semester', icon: '📚', from: 'from-blue-500', to: 'to-indigo-600' },
            { label: 'Total Credits', value: totalCredits, sub: `of ${MAX_CREDITS} max`, icon: '⭐', from: 'from-emerald-500', to: 'to-teal-600' },
            { label: 'Available Courses', value: courseList.length, sub: 'to explore', icon: '🎓', from: 'from-violet-500', to: 'to-purple-600' },
            { label: 'Class Days / Week', value: Object.keys(coursesByDay).length, sub: 'active days', icon: '📅', from: 'from-amber-500', to: 'to-orange-600' },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-gradient-to-br ${kpi.from} ${kpi.to} rounded-2xl p-5 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/75 text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-4xl font-black mt-1">{kpi.value}</p>
                  <p className="text-white/70 text-xs mt-1">{kpi.sub}</p>
                </div>
                <span className="text-4xl opacity-80">{kpi.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-column section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Registered Courses Table — wider */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">📋</span>
                My Subjects
              </h2>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {registeredCourses.length} enrolled
              </span>
            </div>

            {registeredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
                <p className="font-semibold text-slate-700">No subjects enrolled yet</p>
                <p className="text-sm text-slate-500 mt-1">Browse the course catalog to register</p>
                <button onClick={() => navigate('/student/courses')} className="mt-4 bg-indigo-600 text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {registeredCourses.map((course) => {
                  const pendingDrop = getDropStatus(course.id);
                  return (
                    <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-indigo-50/40 transition-colors group">
                      {/* Day pill */}
                      <div className={`${dayColors[course.day] || 'bg-slate-400'} text-white text-[10px] font-black px-2 py-1 rounded-md w-10 text-center shrink-0`}>
                        {dayShort[course.day] || course.day?.slice(0,3).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{course.courseName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{course.courseCode} · {course.startTime}–{course.endTime}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="text-xs font-semibold text-indigo-600">{course.credits} cr</p>
                        <p className="text-xs text-slate-400 truncate max-w-[90px]">{course.instructor}</p>
                        {pendingDrop ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            ⏳ Drop Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => requestDrop(course)}
                            className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-300 hover:border-red-500 px-2 py-0.5 rounded-full transition-all"
                          >
                            Request Drop
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Distribution — narrower */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xs">📊</span>
              <h2 className="text-lg font-bold text-slate-800">Weekly Load</h2>
            </div>

            <div className="p-6 space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const count = coursesByDay[day] || 0;
                const pct = (count / maxDayCount) * 100;
                return (
                  <div key={day}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{day}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                        {count} {count === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className={`${dayColors[day]} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Credit progress */}
            <div className="mx-6 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>Semester Credit Progress</span>
                <span className="text-indigo-600">{totalCredits}/{MAX_CREDITS}</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${creditPct}%` }}
                />
              </div>
              <p className="text-[11px] text-indigo-500 mt-1.5 font-medium text-right">{Math.round(creditPct)}% of max load</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs">🗓</span>
              <h2 className="text-lg font-bold text-slate-800">Weekly Timetable</h2>
            </div>
            <button
              onClick={() => navigate('/student/schedule')}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              Open full schedule
            </button>
          </div>
          <div className="p-6">
            {registeredCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <p className="font-semibold text-slate-700">Your timetable will appear here once courses are approved.</p>
                <p className="mt-1 text-sm text-slate-500">Browse courses and submit registration requests to build your schedule.</p>
              </div>
            ) : (
              <ScheduleGrid />
            )}
          </div>
        </div>

        {/* ── My Drop Requests Status ── */}
        {dropRequests.filter((r) => r.course && registeredCourses.some((c) => c.id === r.course.id) || r.status !== 'pending').length > 0 || myDropRequests.length > 0 ? (
          dropRequests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                <span className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs">📬</span>
                <h2 className="text-lg font-bold text-slate-800">My Drop Requests</h2>
                {myDropRequests.length > 0 && (
                  <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                    {myDropRequests.length} pending
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {[...dropRequests].reverse().map((req) => (
                  <div key={req.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{req.course.courseName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.course.courseCode} · Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">⏳ Awaiting Approval</span>
                    )}
                    {req.status === 'approved' && (
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">✅ Drop Approved</span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-full border border-red-200">❌ Drop Rejected</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : null}

        {/* ── My Registration Requests Status ── */}
        {registrationRequests.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">📝</span>
              <h2 className="text-lg font-bold text-slate-800">My Registration Requests</h2>
              {myRegistrationRequests.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {myRegistrationRequests.length} pending
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {[...registrationRequests].reverse().map((req) => (
                <div key={req.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{req.course.courseName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {req.course.courseCode} · Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {req.status === 'pending' && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">⏳ Awaiting Approval</span>
                  )}
                  {req.status === 'approved' && (
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">✅ Approved</span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-full border border-red-200">❌ Rejected</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── My Waitlisted Courses Status ── */}
        {waitlistRequests.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs">🎟️</span>
              <h2 className="text-lg font-bold text-slate-800">My Waitlists</h2>
              {myWaitlistRequests.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  {myWaitlistRequests.length} on list
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {[...waitlistRequests].reverse().map((req) => (
                <div key={req.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{req.course.courseName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {req.course.courseCode} · Joined {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">⏳ Waiting for spot</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Tips Banner ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Plan Early', desc: 'Register for next semester courses before they fill up.' },
            { icon: '📝', title: 'Track Attendance', desc: 'Maintain ≥75% attendance to be eligible for exams.' },
            { icon: '💡', title: 'Credit Balance', desc: `You have ${MAX_CREDITS - totalCredits} credits left to fill this semester.` },
          ].map((tip) => (
            <div key={tip.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <span className="text-3xl">{tip.icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{tip.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default StudentDashboard;
