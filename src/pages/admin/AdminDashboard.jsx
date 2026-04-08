import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';

const DAY_COLORS = {
  Monday:    { bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' },
  Tuesday:   { bar: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700' },
  Wednesday: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  Thursday:  { bar: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700' },
  Friday:    { bar: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700' },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const AdminDashboard = () => {
  const { 
    courseList, 
    enrollments = [], 
    dropRequests, 
    approveDrop, 
    rejectDrop,
    registrationRequests = [],
    approveRegistration,
    rejectRegistration,
    addStudent,
    showToast
  } = useAppContext();
  const navigate = useNavigate();
  const [filterDay, setFilterDay] = useState('All');
  const [dropTab, setDropTab] = useState('pending'); // 'pending' | 'history'
  const [regTab, setRegTab] = useState('pending'); // 'pending' | 'history'

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ username: '', email: '', password: '' });
  const [addingStudent, setAddingStudent] = useState(false);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    const res = await addStudent(newStudent);
    if (res.success) {
      setShowAddStudentModal(false);
      setNewStudent({ username: '', email: '', password: '' });
    }
    setAddingStudent(false);
  };

  const stats = useMemo(() => {
    const totalCourses = courseList.length;
    const totalCredits = courseList.reduce((sum, c) => sum + c.credits, 0);
    const avgCredits = totalCourses > 0 ? (totalCredits / totalCourses).toFixed(1) : 0;
    const uniqueInstructors = new Set(courseList.map((c) => c.instructor)).size;

    const coursesByDay = courseList.reduce((acc, c) => {
      acc[c.day] = (acc[c.day] || 0) + 1;
      return acc;
    }, {});

    const busiestDay = Object.entries(coursesByDay).reduce(
      (max, [day, count]) => (count > max.count ? { day, count } : max),
      { day: 'N/A', count: 0 }
    );

    const creditDistribution = courseList.reduce((acc, c) => {
      acc[c.credits] = (acc[c.credits] || 0) + 1;
      return acc;
    }, {});

    return { totalCourses, totalCredits, avgCredits, uniqueInstructors, coursesByDay, busiestDay, creditDistribution };
  }, [courseList, enrollments]);

  const filteredCourses = useMemo(() => {
    if (filterDay === 'All') return courseList;
    return courseList.filter((c) => c.day === filterDay);
  }, [courseList, filterDay]);

  const maxDayCount = Math.max(...Object.values(stats.coursesByDay), 1);
  const maxCreditCount = Math.max(...Object.values(stats.creditDistribution), 1);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 p-8 text-white shadow-2xl">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">CourseCrafter · Admin Control Panel</p>
              <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">{today}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/admin/manage-courses')}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all text-sm flex items-center gap-2"
                >
                  <span>⚙️</span> Manage Courses
                </button>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-white text-slate-800 hover:bg-slate-100 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-white/30 hover:scale-105 transition-all text-sm flex items-center gap-2"
                >
                  <span>👨‍🎓</span> Add Student
                </button>
              </div>
            </div>

            {/* Quick summary chips */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: 'Total Courses', value: stats.totalCourses, color: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
                { label: 'Instructors', value: stats.uniqueInstructors, color: 'bg-violet-500/20 border-violet-500/30 text-violet-300' },
                { label: 'Total Credits', value: stats.totalCredits, color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
                { label: 'Avg Credits', value: stats.avgCredits, color: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
              ].map((chip) => (
                <div key={chip.label} className={`border ${chip.color} rounded-xl px-4 py-3 text-center`}>
                  <p className="text-2xl font-black">{chip.value}</p>
                  <p className="text-xs font-semibold opacity-80 mt-0.5">{chip.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Courses', value: stats.totalCourses, sub: 'in catalog', icon: '📚', from: 'from-blue-500', to: 'to-indigo-600' },
            { label: 'Total Credits', value: stats.totalCredits, sub: 'across all courses', icon: '⭐', from: 'from-emerald-500', to: 'to-teal-600' },
            { label: 'Faculty Members', value: stats.uniqueInstructors, sub: 'unique instructors', icon: '👨‍🏫', from: 'from-violet-500', to: 'to-purple-600' },
            { label: 'Avg Credits / Course', value: stats.avgCredits, sub: 'credit load avg', icon: '📊', from: 'from-amber-500', to: 'to-orange-600' },
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

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Day Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">📅</span>
              <h2 className="text-lg font-bold text-slate-800">Course Distribution by Day</h2>
            </div>
            <div className="p-6 space-y-4">
              {DAYS.map((day) => {
                const count = stats.coursesByDay[day] || 0;
                const pct = (count / maxDayCount) * 100;
                const colors = DAY_COLORS[day];
                return (
                  <div key={day}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{day}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${count > 0 ? colors.badge : 'bg-slate-100 text-slate-400'}`}>
                        {count} {count === 1 ? 'course' : 'courses'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`${colors.bar} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Busiest Day:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${DAY_COLORS[stats.busiestDay.day]?.badge || 'bg-slate-100 text-slate-600'}`}>
                  {stats.busiestDay.day} — {stats.busiestDay.count} courses
                </span>
              </div>
            </div>
          </div>

          {/* Credit Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <span className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs">⭐</span>
              <h2 className="text-lg font-bold text-slate-800">Credit Distribution</h2>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(stats.creditDistribution)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([credits, count]) => {
                  const pct = (count / maxCreditCount) * 100;
                  return (
                    <div key={credits}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{credits} {Number(credits) === 1 ? 'Credit' : 'Credits'}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {count} {count === 1 ? 'course' : 'courses'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ── All Courses Table ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center text-white text-xs">🗂️</span>
              <h2 className="text-lg font-bold text-slate-800">All Courses</h2>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                {filteredCourses.length} shown
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter:</label>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
              >
                <option value="All">All Days</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="font-semibold text-slate-700">No courses for {filterDay}</p>
              <p className="text-sm text-slate-400 mt-1">Try selecting a different day</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <div className="col-span-1">Code</div>
                <div className="col-span-4">Course Name</div>
                <div className="col-span-2">Instructor</div>
                <div className="col-span-2">Day</div>
                <div className="col-span-2">Timing</div>
                <div className="col-span-1 text-center">Credits</div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredCourses.map((course) => {
                  const colors = DAY_COLORS[course.day] || { badge: 'bg-slate-100 text-slate-600', bar: '' };
                  return (
                    <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-indigo-50/30 transition-colors items-center group">
                      <div className="md:col-span-1">
                        <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                          {course.courseCode}
                        </span>
                      </div>
                      <div className="md:col-span-4">
                        <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{course.courseName}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-600 flex items-center gap-1"><span>👨‍🏫</span> {course.instructor}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>{course.day}</span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-600 flex items-center gap-1"><span>🕐</span> {course.startTime}–{course.endTime}</p>
                      </div>
                      <div className="md:col-span-1 text-center">
                        <span className="text-sm font-black text-emerald-600">{course.credits}</span>
                        <span className="text-xs text-slate-400"> cr</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 text-center">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-bold text-indigo-600">{filteredCourses.length}</span> of{' '}
                  <span className="font-bold text-indigo-600">{courseList.length}</span> total courses
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Registration Requests Panel ── */}
        {(() => {
          const pending = registrationRequests.filter((r) => r.status === 'pending');
          const history = registrationRequests.filter((r) => r.status !== 'pending');
          const displayed = regTab === 'pending' ? pending : history;
          return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">📝</span>
                  <h2 className="text-lg font-bold text-slate-800">Registration Requests</h2>
                  {pending.length > 0 && (
                    <span className="text-xs font-black bg-blue-500 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                      {pending.length} pending
                    </span>
                  )}
                </div>
                {/* Tabs */}
                <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
                  <button
                    onClick={() => setRegTab('pending')}
                    className={`px-4 py-2 transition-colors ${
                      regTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Pending ({pending.length})
                  </button>
                  <button
                    onClick={() => setRegTab('history')}
                    className={`px-4 py-2 transition-colors ${
                      regTab === 'history' ? 'bg-slate-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    History ({history.length})
                  </button>
                </div>
              </div>

              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-5xl mb-3">{regTab === 'pending' ? '✅' : '📂'}</div>
                  <p className="font-semibold text-slate-700">
                    {regTab === 'pending' ? 'No pending registration requests' : 'No resolved requests yet'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">All clear!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {[...displayed].reverse().map((req) => (
                    <div key={req.id} className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">

                      {/* Student Info */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                          {req.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{req.studentName || 'Student'}</p>
                          <p className="text-xs text-slate-500">
                            Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono">
                            {req.course.courseCode}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm">{req.course.courseName}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>👨‍🏫 {req.course.instructor}</span>
                          <span>📅 {req.course.day} · {req.course.startTime}–{req.course.endTime}</span>
                          <span>⭐ {req.course.credits} Credits</span>
                        </div>
                      </div>

                      {/* Action / Status */}
                      <div className="flex gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => approveRegistration(req.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectRegistration(req.id)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white border border-red-300 hover:border-red-600 text-xs font-bold rounded-xl transition-colors"
                            >
                              ✕ Reject
                            </button>
                          </>
                        ) : req.status === 'approved' ? (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-4 py-2 rounded-xl border border-green-200">✅ Approved</span>
                        ) : (
                          <span className="text-xs font-bold bg-red-100 text-red-700 px-4 py-2 rounded-xl border border-red-200">❌ Rejected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Drop Requests Panel ── */}
        {(() => {
          const pending = dropRequests.filter((r) => r.status === 'pending');
          const history = dropRequests.filter((r) => r.status !== 'pending');
          const displayed = dropTab === 'pending' ? pending : history;
          return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs">📬</span>
                  <h2 className="text-lg font-bold text-slate-800">Drop Requests</h2>
                  {pending.length > 0 && (
                    <span className="text-xs font-black bg-red-500 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                      {pending.length} pending
                    </span>
                  )}
                </div>
                {/* Tabs */}
                <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
                  <button
                    onClick={() => setDropTab('pending')}
                    className={`px-4 py-2 transition-colors ${
                      dropTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Pending ({pending.length})
                  </button>
                  <button
                    onClick={() => setDropTab('history')}
                    className={`px-4 py-2 transition-colors ${
                      dropTab === 'history' ? 'bg-slate-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    History ({history.length})
                  </button>
                </div>
              </div>

              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-5xl mb-3">{dropTab === 'pending' ? '✅' : '📂'}</div>
                  <p className="font-semibold text-slate-700">
                    {dropTab === 'pending' ? 'No pending drop requests' : 'No resolved requests yet'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">All clear!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {[...displayed].reverse().map((req) => (
                    <div key={req.id} className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">

                      {/* Student Info */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                          {req.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{req.studentName || 'Student'}</p>
                          <p className="text-xs text-slate-500">
                            Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono">
                            {req.course.courseCode}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm">{req.course.courseName}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>👨‍🏫 {req.course.instructor}</span>
                          <span>📅 {req.course.day} · {req.course.startTime}–{req.course.endTime}</span>
                          <span>⭐ {req.course.credits} Credits</span>
                        </div>
                      </div>

                      {/* Action / Status */}
                      <div className="flex gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => approveDrop(req.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectDrop(req.id)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white border border-red-300 hover:border-red-600 text-xs font-bold rounded-xl transition-colors"
                            >
                              ✕ Reject
                            </button>
                          </>
                        ) : req.status === 'approved' ? (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-4 py-2 rounded-xl border border-green-200">✅ Approved</span>
                        ) : (
                          <span className="text-xs font-bold bg-red-100 text-red-700 px-4 py-2 rounded-xl border border-red-200">❌ Rejected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Add Student Modal ── */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animation-fade-in-up">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-sm">👨‍🎓</span>
                  Add New Student
                </h3>
                <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Username</label>
                    <input 
                      type="text" 
                      required
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400" 
                      placeholder="e.g. john_doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Email</label>
                    <input 
                      type="email" 
                      required
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400" 
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Password</label>
                    <input 
                      type="password" 
                      required
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400" 
                      placeholder="Enter a secure password"
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddStudentModal(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={addingStudent}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                      {addingStudent ? <span className="animate-pulse">Adding...</span> : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard;
