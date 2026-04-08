import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { API_URL } from '../../config/api';

const InstructorDashboard = () => {
  const { currentUser, logout } = useAppContext();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchInstructorCourses();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchInstructorCourses = async () => {
    if (!currentUser?.username) {
      logout();
      navigate('/login', { replace: true });
      setError('Instructor session is missing. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/instructor/${currentUser.username}/courses`);
      if (!res.ok) {
        throw new Error('Failed to load instructor courses');
      }
      const data = await res.json();
      const safeCourses = Array.isArray(data) ? data : [];
      setCourses(safeCourses);
      setError('');
      if (safeCourses.length > 0) {
        setSelectedCourse(safeCourses[0]);
        fetchRoster(safeCourses[0].id);
      } else {
        setSelectedCourse(null);
        setRoster([]);
      }
    } catch (e) {
      console.error(e);
      setCourses([]);
      setSelectedCourse(null);
      setRoster([]);
      logout();
      navigate('/login', { replace: true });
      setError('We could not load the instructor dashboard right now. Please sign in again.');
    }
    setLoading(false);
  };

  const fetchRoster = async (courseId) => {
    setRosterLoading(true);
    try {
      const res = await fetch(`${API_URL}/instructor/course/${courseId}/students`);
      if (!res.ok) {
        throw new Error('Failed to load student roster');
      }
      const data = await res.json();
      setRoster(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRoster([]);
      setError('Roster data could not be loaded for the selected course.');
    }
    setRosterLoading(false);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setNewStudentUsername('');
    fetchRoster(course.id);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentUsername.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/instructor/course/${selectedCourse.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentUsername: newStudentUsername })
      });
      if (res.ok) {
         setNewStudentUsername('');
         fetchRoster(selectedCourse.id);
         fetchInstructorCourses(); // refresh counts
      } else {
         const err = await res.json();
         alert(err.message || 'Failed to add student');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
    setActionLoading(false);
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student from the course?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/instructor/course/${selectedCourse.id}/students/${studentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
         fetchRoster(selectedCourse.id);
         fetchInstructorCourses(); // refresh counts
      } else {
         const err = await res.json();
         alert(err.message || 'Failed to remove student');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
    setActionLoading(false);
  };

  const handleDeleteAccount = async (studentId) => {
    if (!window.confirm("WARNING: Are you sure you want to COMPLETELY DELETE this student's account from the system? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/instructor/students/${studentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
         fetchRoster(selectedCourse.id);
         fetchInstructorCourses(); // refresh counts
      } else {
         const err = await res.json();
         alert(err.message || 'Failed to delete student account');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-pulse">📖</div>
            <p className="text-slate-500 font-medium">Loading your courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">
              👨‍🏫
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Instructor Dashboard</h1>
              <p className="text-slate-500 text-sm">Welcome back, <span className="font-semibold text-emerald-600">{currentUser?.username}</span></p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-50 border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">My Courses</p>
                <p className="text-3xl font-extrabold text-slate-800">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-emerald-50 border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="text-3xl font-extrabold text-slate-800">
                  {courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-50 border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Credits</p>
                <p className="text-3xl font-extrabold text-slate-800">
                  {courses.reduce((sum, c) => sum + c.credits, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Courses Assigned</h2>
            <p className="text-slate-500">You haven't been assigned any courses yet. Contact your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <h2 className="text-lg font-bold">📋 My Courses</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Select a course to view roster</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full text-left px-5 py-4 transition-all duration-200 hover:bg-slate-50 ${
                        selectedCourse?.id === course.id 
                          ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{course.courseCode}</span>
                          <p className="font-semibold text-slate-800 text-sm mt-0.5">{course.courseName}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {course.credits} cr
                            </span>
                            <span className="text-xs text-slate-500">
                              {course.day} • {course.startTime}-{course.endTime}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-800">{course.enrolledCount || 0}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">students</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Roster */}
            <div className="lg:col-span-2">
              {selectedCourse && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold">
                          {selectedCourse.courseCode} — Student Roster
                        </h2>
                        <p className="text-xs text-indigo-100 mt-0.5">{selectedCourse.courseName}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl border border-white/30">
                        <p className="text-xl font-extrabold">{roster.length}</p>
                        <p className="text-[10px] uppercase tracking-wider text-indigo-100">Enrolled</p>
                      </div>
                    </div>
                  </div>

                  {/* Add Student Form */}
                  <div className="bg-slate-50 border-b border-slate-100 p-4">
                    <form onSubmit={handleAddStudent} className="flex gap-3">
                      <input 
                        type="text" 
                        value={newStudentUsername}
                        onChange={(e) => setNewStudentUsername(e.target.value)}
                        placeholder="Enter student username to add..."
                        className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={actionLoading}
                      />
                      <button 
                        type="submit"
                        disabled={actionLoading || !newStudentUsername.trim()}
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                       {actionLoading ? 'Adding...' : 'Add Student +'}
                      </button>
                    </form>
                  </div>

                  {rosterLoading ? (
                    <div className="p-12 text-center">
                      <div className="text-4xl mb-3 animate-pulse">⏳</div>
                      <p className="text-slate-500">Loading roster...</p>
                    </div>
                  ) : roster.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-5xl mb-3">🫥</div>
                      <p className="text-slate-500 font-medium">No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roster.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-slate-800">{student.username}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-slate-500 text-sm">{student.email || '—'}</p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleRemoveStudent(student.id)}
                                    disabled={actionLoading}
                                    className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-transparent hover:border-orange-200"
                                    title="Drop from course"
                                  >
                                    Drop
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteAccount(student.id)}
                                    disabled={actionLoading}
                                    className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-red-200"
                                    title="Delete entire account"
                                  >
                                    Delete Account
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InstructorDashboard;
