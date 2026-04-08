import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // User state
  const [userRole, setUserRole] = useState(null); // 'student' or 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Course state
  const [courseList, setCourseList] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);

  // Drop requests
  const [dropRequests, setDropRequests] = useState([]);
  
  // Registration requests
  const [registrationRequests, setRegistrationRequests] = useState([]);
  
  // Waitlist requests
  const [waitlistRequests, setWaitlistRequests] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Load Initial Courses and Auth State (if saved in localStorage)
  useEffect(() => {
    fetchCourses();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        hydrateUserSession(parsedUser);
      } catch (e) {
        console.error('Failed to restore saved session', e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/courses`);
      const data = await res.json();
      setCourseList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegisteredCourses = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/student/${userId}/courses`);
      const data = await res.json();
      setRegisteredCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDropRequests = async (userId = null, role = 'admin') => {
    try {
      const url = role === 'admin'
        ? `${API_URL}/admin/drop-requests`
        : `${API_URL}/student/${userId}/drop-requests`;
      const res = await fetch(url);
      const data = await res.json();
      setDropRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegistrationRequests = async (userId, role) => {
    try {
      const url = role === 'admin' 
        ? `${API_URL}/admin/registration-requests` 
        : `${API_URL}/student/${userId}/registration-requests`;
      const res = await fetch(url);
      const data = await res.json();
      setRegistrationRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWaitlistRequests = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/student/${userId}/waitlist-requests`);
      const data = await res.json();
      setWaitlistRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${userId}`);
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshStudentData = (userId = currentUser?.id) => {
    if (!userId) return;
    fetchRegisteredCourses(userId);
    fetchRegistrationRequests(userId, 'student');
    fetchWaitlistRequests(userId);
    fetchDropRequests(userId, 'student');
    fetchCourses();
  };

  const refreshAdminData = () => {
    fetchDropRequests();
    fetchRegistrationRequests(null, 'admin');
    fetchCourses();
  };

  const hydrateUserSession = (userData) => {
    if (!userData || !userData.role || !['student', 'admin'].includes(userData.role)) {
      localStorage.removeItem('currentUser');
      return;
    }

    if (!userData.username || userData.id == null) {
      localStorage.removeItem('currentUser');
      return;
    }

    setCurrentUser(userData);
    setUserRole(userData.role);
    setIsAuthenticated(true);

    if (userData.role === 'student') {
      refreshStudentData(userData.id);
    }
    if (userData.role === 'admin') {
      refreshAdminData();
    }
    fetchNotifications(userData.id);
  };

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) {
      return undefined;
    }

    const refreshData = () => {
      if (userRole === 'student') {
        refreshStudentData(currentUser.id);
      } else if (userRole === 'admin') {
        refreshAdminData();
      }
      fetchNotifications(currentUser.id);
    };

    const intervalId = setInterval(refreshData, 5000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, currentUser, userRole]);

  const markNotificationRead = async (notificationId) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, { method: 'POST' });
      if (res.ok && currentUser) {
        fetchNotifications(currentUser.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/notifications/${currentUser.id}/read-all`, { method: 'POST' });
      if (res.ok) {
        fetchNotifications(currentUser.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth actions
  const login = async (role, userData) => {
    // We expect the backend login or signup to supply the user object
    localStorage.setItem('currentUser', JSON.stringify(userData));
    hydrateUserSession(userData);
  };

  const logout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRegisteredCourses([]);
    setDropRequests([]);
    setRegistrationRequests([]);
    setWaitlistRequests([]);
    setNotifications([]);
    localStorage.removeItem('currentUser');
  };

  // Course management actions (Admin)
  const addCourse = async (course) => {
    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      if (res.ok) {
        fetchCourses();
        showToast('Course added successfully', 'success');
      }
    } catch (e) {
      showToast('Error adding course', 'error');
    }
  };

  const updateCourse = async (updatedCourse) => {
    try {
      const res = await fetch(`${API_URL}/courses/${updatedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourse)
      });
      if (res.ok) {
        fetchCourses();
        showToast('Course updated successfully', 'success');
      }
    } catch (e) {
      showToast('Error updating course', 'error');
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCourseList((prev) => prev.filter((course) => course.id !== courseId));
        showToast('Course deleted successfully', 'success');
      } else {
        showToast(`Course could not be deleted. Server returned ${res.status}.`, 'error');
      }
    } catch (e) {
      showToast('Error deleting course', 'error');
    }
  };

  // Student course registration actions
  const registerCourse = async (course) => {
    if(!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/student/${currentUser.id}/register-request/${course.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'waitlisted') {
          refreshStudentData(currentUser.id);
          showToast(data.message || 'Added to waitlist', 'info');
        } else {
          refreshStudentData(currentUser.id);
          showToast('Registration request submitted', 'success');
        }
      } else {
        const error = await res.json();
        showToast(error.message || 'Error registering', 'error');
      }
    } catch (e) {
      showToast('Failed to connect to server', 'error');
    }
  };

  // The original unregisterCourse just removed immediately. Now we use drop requests, or support direct unregister?
  // Frontend originally treated requestDrop as separate, but let's keep unregisterCourse here as direct drop or ignore if they must request.
  // Actually, wait, let's implement unregisterCourse as request for simplicity or if they use a direct "Delete" button.
  // App.jsx and Courses.jsx likely used registerCourse / requestDrop. 
  // Let's mock a direct delete if the code uses it.
  const unregisterCourse = async (courseId) => {
    // In our backend, we enforce DropRequests, so let's redirect to that or allow direct if admin
    showToast('Please use "Request Drop" instead from the schedule page', 'info');
  };

  // ── Drop Request actions ──────────────────────────────────────
  const requestDrop = async (course) => {
    if(!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/student/${currentUser.id}/drop-request/${course.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchDropRequests(currentUser.id, 'student');
        showToast('Drop request submitted. Awaiting admin approval.', 'info');
      } else {
        const error = await res.json();
        showToast(error.message || 'Already requested', 'info');
      }
    } catch (e) {
       showToast('Server error', 'error');
    }
  };

  const approveDrop = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/admin/drop-requests/${requestId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        refreshAdminData();
        showToast('Drop request approved', 'success');
      }
    } catch (e) {
       showToast('Error approving', 'error');
    }
  };

  const rejectDrop = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/admin/drop-requests/${requestId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        refreshAdminData();
        showToast('Drop request rejected', 'success');
      }
    } catch (e) {
       showToast('Error rejecting', 'error');
    }
  };

  // ── Registration Request actions ──────────────────────────────
  const approveRegistration = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/admin/registration-requests/${requestId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        refreshAdminData();
        showToast('Registration approved', 'success');
      }
    } catch (e) {
       showToast('Error approving registration', 'error');
    }
  };

  const rejectRegistration = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/admin/registration-requests/${requestId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        refreshAdminData();
        showToast('Registration rejected', 'success');
      }
    } catch (e) {
       showToast('Error rejecting registration', 'error');
    }
  };

  const addStudent = async (studentData) => {
    try {
      const res = await fetch(`${API_URL}/admin/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (res.ok) {
        showToast('Student added successfully', 'success');
        return { success: true };
      } else {
        const data = await res.json();
        showToast(data.message || 'Error adding student', 'error');
        return { success: false, message: data.message };
      }
    } catch (e) {
       showToast('Server error', 'error');
       return { success: false };
    }
  };

  // Toast notification
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const value = {
    userRole,
    currentUser,
    isAuthenticated,
    courseList,
    registeredCourses,
    dropRequests,
    registrationRequests,
    waitlistRequests,
    notifications,
    toast,
    login,
    logout,
    addCourse,
    updateCourse,
    deleteCourse,
    registerCourse,
    unregisterCourse,
    requestDrop,
    approveDrop,
    rejectDrop,
    approveRegistration,
    rejectRegistration,
    addStudent,
    markNotificationRead,
    markAllNotificationsRead,
    showToast,
    refreshStudentData,
    refreshAdminData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
