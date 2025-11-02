# TODO: Update Attendance Metrics to Use Expected Classes

## Steps to Complete
- [x] Add calculateExpectedClasses helper function to compute expected classes for date range (3 Mon-Thu, 2 Fri)
- [x] Update getStudentAttendanceStats to extract start/end dates from whereClause
- [x] For each student, calculate expected classes using the helper function
- [x] Update student mapping to set total_classes to expected value and compute rates as counts/expected
- [x] Remove the having clause since expected classes will always be >0
- [x] Test the updated API endpoint to ensure rates are calculated correctly
- [x] Check if the summary endpoint displays accurate metrics
- [x] Update frontend if needed to reflect the changes
