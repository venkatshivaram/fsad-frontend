import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';

const getNameParts = (currentUser) => {
  const rawName = String(currentUser?.name || currentUser?.fullName || currentUser?.username || '').trim();
  if (!rawName) {
    return { firstName: '', lastName: '' };
  }

  const parts = rawName.split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
};

const buildProfileData = (currentUser) => {
  const { firstName, lastName } = getNameParts(currentUser);

  return {
    firstName,
    lastName,
    studentId: currentUser?.username || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    year: currentUser?.year || '',
    gpa: currentUser?.gpa || '',
    address: currentUser?.address || ''
  };
};

const getInitials = (firstName, lastName, studentId) => {
  const first = String(firstName || '').trim().charAt(0);
  const last = String(lastName || '').trim().charAt(0);
  const fallback = String(studentId || 'S').trim().charAt(0);
  return `${first || fallback}${last || ''}`.toUpperCase();
};

const displayValue = (value) => (String(value || '').trim() ? value : 'Not provided');

const Profile = () => {
  const { registeredCourses, showToast, currentUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  const profileData = useMemo(() => buildProfileData(currentUser), [currentUser]);
  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);
  const totalCourses = registeredCourses.length;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    showToast('Profile editing is local only right now. No backend profile save endpoint exists yet.', 'info');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {getInitials(profileData.firstName, profileData.lastName, profileData.studentId)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {displayValue(`${profileData.firstName} ${profileData.lastName}`.trim())}
              </h2>
              <p className="text-slate-600 mb-2">{displayValue(profileData.studentId)}</p>
              <div className="flex gap-4 text-sm text-slate-600 flex-wrap">
                <span>{displayValue(profileData.email)}</span>
                <span>{displayValue(profileData.phone)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-slate-600 mb-1">GPA</div>
            <div className="text-3xl font-bold text-green-600">{displayValue(profileData.gpa)}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-slate-600 mb-1">Year</div>
            <div className="text-3xl font-bold text-blue-600">{displayValue(profileData.year)}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-slate-600 mb-1">Courses</div>
            <div className="text-3xl font-bold text-purple-600">{totalCourses}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-slate-600 mb-1">Credits</div>
            <div className="text-3xl font-bold text-orange-600">{totalCredits}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
            <p className="text-xs text-slate-500">
              Only username and email currently come from the backend account.
            </p>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                  placeholder={isEditing ? 'Enter phone number' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                  placeholder={isEditing ? 'Enter department' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                >
                  <option value="">Select year</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">GPA</label>
                <input
                  type="text"
                  name="gpa"
                  value={formData.gpa}
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
                  placeholder={isEditing ? 'Enter address' : ''}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
