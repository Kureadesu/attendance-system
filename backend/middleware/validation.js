// middleware/validation.js
export const validateStudentNumber = (studentNumber) => {
  const regex = /^\d{5}[A-Z]{2}-\d{6}$/;
  return regex.test(studentNumber);
};

export const validateAttendance = (req, res, next) => {
  const { date, subjectId, attendanceRecords } = req.body;

  if (!date || !subjectId || !attendanceRecords) {
    return res.status(400).json({ 
      error: 'Date, subjectId, and attendanceRecords are required' 
    });
  }

  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    return res.status(400).json({ 
      error: 'attendanceRecords must be a non-empty array' 
    });
  }

  for (const record of attendanceRecords) {
    if (!record.studentNumber || !record.status) {
      return res.status(400).json({ 
        error: 'Each record must have studentNumber and status' 
      });
    }

    if (!['present', 'absent', 'late'].includes(record.status)) {
      return res.status(400).json({ 
        error: 'Status must be present, absent, or late' 
      });
    }

    if (!validateStudentNumber(record.studentNumber)) {
      return res.status(400).json({ 
        error: `Invalid student number format: ${record.studentNumber}` 
      });
    }
  }

  next();
};