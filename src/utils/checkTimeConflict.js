/**
 * Checks if a new course conflicts with existing registered courses
 * @param {Array} existingCourses - Array of already registered courses
 * @param {Object} newCourse - The course to check for conflicts
 * @returns {Object} { hasConflict: boolean, conflictingCourse: Object|null }
 */
export function checkTimeConflict(existingCourses, newCourse) {
  for (const existingCourse of existingCourses) {
    // Check if courses are on the same day
    if (existingCourse.day === newCourse.day) {
      // Convert time strings to comparable format (HH:MM to minutes)
      const existingStart = timeToMinutes(existingCourse.startTime);
      const existingEnd = timeToMinutes(existingCourse.endTime);
      const newStart = timeToMinutes(newCourse.startTime);
      const newEnd = timeToMinutes(newCourse.endTime);

      // Check for time overlap
      // Overlap occurs when: newStart < existingEnd AND newEnd > existingStart
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          hasConflict: true,
          conflictingCourse: existingCourse
        };
      }
    }
  }

  return {
    hasConflict: false,
    conflictingCourse: null
  };
}

/**
 * Converts time string (HH:MM) to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}
