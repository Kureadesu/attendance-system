// backend/utils/initializeData.js
import { Student, Subject } from '../models/index.js';

const initializeData = async (req, res) => {
  try {
    // Initialize Subjects
    const subjects = [
      { name: 'Management and Organization Concept', schedule: 'TTH 5:00PM-6:30PM', room: 'Room 104B' },
      { name: 'SCM', schedule: 'MW 6:00PM-7:30PM', room: 'Room 104B' },
      { name: 'ACRM', schedule: 'TTH 2:00PM-3:30PM', room: 'Room 104B' },
      { name: 'System Infrastructure and Integration', schedule: 'TTH 3:30PM-5:00PM', room: 'Room 104B' },
      { name: 'Capstone Project 2', schedule: 'F 1:00PM-4:00PM', room: 'Room 104B' },
      { name: 'Management Information System', schedule: 'MW 1:30PM-3:00PM', room: 'Lab 4' },
      { name: 'Advance Computer System', schedule: 'MW 3:00PM-5:30PM', room: 'Lab 4' },
      { name: 'Enterprise Architecture', schedule: 'F 4:00PM-7:00PM', room: 'Room 104B' }
    ];

    await Subject.bulkCreate(subjects, { ignoreDuplicates: true });

    // Initialize Students
    const students = [
      {
        student_number: '12223MN-000540',
        name: 'Claire Angeli J. Balaba',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      // Add more students as needed
    ];

    await Student.bulkCreate(students, { ignoreDuplicates: true });
    console.log('✓ Students created');

    console.log('Database initialization completed!');
    console.log(`Created ${subjects.length} subjects and ${students.length} students`);

  } catch (error) {
    console.error('Initialization error:', error);
  }
};

export default initializeData;