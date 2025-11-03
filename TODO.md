# TODO: Update Dashboard.jsx for New Subject Format

## Information Gathered
- Subjects now have a `schedules` array (from SubjectSchedule model) instead of a single `schedule` string.
- Backend `attendanceController.js` currently sets `schedule: s.subject.room` in subject stats, which is incorrect.
- Frontend `Dashboard.jsx` displays `subject.schedule` as a string in "Best Performing Subjects" and "Subjects Needing Attention" sections.
- Need to update backend to include schedules array in subject stats response.
- Need to update frontend to format and display the schedules array properly.

## Plan
1. Update `backend/controllers/attendanceController.js`:
   - Modify the subject stats query to include SubjectSchedule in the Subject include.
   - Update the mapping to include `schedules` array instead of `schedule` string.

2. Update `client/src/components/Dashboard.jsx`:
   - Replace `subject.schedule` with formatted string from `subject.schedules` array.
   - Format as: "Day HH:MM-HH:MM, Day HH:MM-HH:MM, ..."

## Dependent Files to Edit
- `backend/controllers/attendanceController.js`
- `client/src/components/Dashboard.jsx`

## Followup Steps
- Test the dashboard by refreshing to ensure subject schedules display correctly.
- If needed, implement additional features like Schedule Viewer page or Current Class widget.
