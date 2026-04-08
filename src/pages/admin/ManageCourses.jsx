import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { useAppContext } from '../../context/AppContext';

const ManageCourses = () => {
  const { courseList, addCourse, updateCourse, deleteCourse, showToast } =
    useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('All');
  const [sortBy, setSortBy] = useState('courseCode');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    instructor: '',
    credits: '',
    capacity: 30,
    day: 'Monday',
    startTime: '',
    endTime: ''
  });

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courseList.filter((course) => {
      const matchesSearch =
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDay = filterDay === 'All' || course.day === filterDay;
      
      return matchesSearch && matchesDay;
    });

    // Sort filtered courses
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle numeric sorting for credits
      if (sortBy === 'credits') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        // String sorting
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [courseList, searchTerm, filterDay, sortBy, sortOrder]);

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        courseCode: '',
        courseName: '',
        instructor: '',
        credits: '',
        capacity: 30,
        day: 'Monday',
        startTime: '',
        endTime: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate time
    if (formData.startTime >= formData.endTime) {
      showToast('End time must be after start time', 'error');
      return;
    }

    const courseData = {
      ...formData,
      credits: parseInt(formData.credits),
      capacity: parseInt(formData.capacity)
    };

    if (editingCourse) {
      updateCourse({ ...courseData, id: editingCourse.id });
    } else {
      addCourse(courseData);
    }

    handleCloseModal();
  };

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Manage Courses</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add New Course
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code, name, or instructor..."
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
                <option value="All">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterDay !== 'All') && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-bold text-blue-600">{filteredAndSortedCourses.length}</span> of{' '}
                <span className="font-bold text-blue-600">{courseList.length}</span> courses
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDay('All');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredAndSortedCourses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-500 text-lg mb-2">No courses found</p>
              <p className="text-slate-400 text-sm">
                {searchTerm || filterDay !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Add your first course to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('courseCode')}
                    >
                      <div className="flex items-center gap-2">
                        Code
                        {sortBy === 'courseCode' && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('courseName')}
                    >
                      <div className="flex items-center gap-2">
                        Course Name
                        {sortBy === 'courseName' && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('instructor')}
                    >
                      <div className="flex items-center gap-2">
                        Instructor
                        {sortBy === 'instructor' && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('credits')}
                    >
                      <div className="flex items-center gap-2">
                        Credits
                        {sortBy === 'credits' && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                        onClick={() => handleSort('capacity')}
                    >
                      <div className="flex items-center gap-2">
                        Capacity
                        {sortBy === 'capacity' && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('day')}
                    >
                      <div className="flex items-center gap-2">
                        Day
                        {sortBy === 'day' && (
                          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">Time</th>
                    <th className="px-6 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCourses.map((course, index) => (
                  <tr
                    key={course.id}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    } hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                      {course.courseCode}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {course.courseName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {course.instructor}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {course.credits}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {course.capacity}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{course.day}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {course.startTime} - {course.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(course)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors"
                        >
                          Delete
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
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Course Code
              </label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CS101"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Credits
              </label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                required
                min="1"
                max="6"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduction to Programming"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Instructor
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Day
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ManageCourses;
