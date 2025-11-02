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
        student_number: '12223MN-000401',
        name: 'Acosta, Tristan D.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000580',
        name: 'Alcantara, Clurk Joshua P.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000539',
        name: 'Andres, Justin F.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000533',
        name: 'Aproda, Jeremy S.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000540',
        name: 'Balaba, Claire Angeli J.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000541',
        name: 'Bandiez, Cristopher A.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000542',
        name: 'Baterisna, John Alex V.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000543',
        name: 'Bautista, Prinz Zedric',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000488',
        name: 'Blanquisco, Shiryl Anne C.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000489',
        name: 'Bodota, Raymond V.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000490',
        name: 'Brazil, Kurt Sebastian J.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000495',
        name: 'Cañendo, Blasslie Jhay',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000483',
        name: 'Cortez, Micko Gabriel A.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000478',
        name: 'Dean, Daniela',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000485',
        name: 'Dela Cruz, Kyle Joshua M.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000487',
        name: 'Dulay, Luis Miguel G.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000480',
        name: 'Francisco, Mary Paula L.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000482',
        name: 'Fuertes, Joshua Brynne',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000627',
        name: 'Reyes, Michaella Mae B.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000629',
        name: 'Roa, Noa R.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000631',
        name: 'Rosales, Denise Joy L.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000636',
        name: 'Sembrano, Anna Gianneli C.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
      {
        student_number: '12223MN-000639',
        name: 'Tabago, Dories R.',
        section: 'BSAIS 4-1',
        year_level: '4th Year'
      },
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