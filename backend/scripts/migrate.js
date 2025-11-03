// scripts/migrate.js
import sequelize from '../config/database.js';
import { Subject, SubjectSchedule, Attendance } from '../models/index.js';

/**
 * Migration script to transition from old schema to new schema
 */
async function migrate() {
  try {
    console.log('Starting migration...');

    // Step 1: Create backup of existing data if needed
    console.log('Step 1: Backing up existing attendance data...');
    const existingAttendance = await sequelize.query(
      'SELECT * FROM attendance WHERE schedule_id IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(`Found ${existingAttendance.length} attendance records without schedule_id`);

    // Step 2: For each attendance record without schedule_id, assign appropriate schedule
    console.log('Step 2: Assigning schedule_id to existing attendance records...');
    
    for (const record of existingAttendance) {
      const attendanceDate = new Date(record.date);
      const dayOfWeek = attendanceDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Find matching schedule for this subject and day
      const schedule = await SubjectSchedule.findOne({
        where: {
          subject_id: record.subject_id,
          day_of_week: dayOfWeek
        }
      });

      if (schedule) {
        await sequelize.query(
          'UPDATE attendance SET schedule_id = ? WHERE id = ?',
          {
            replacements: [schedule.id, record.id],
            type: sequelize.QueryTypes.UPDATE
          }
        );
        console.log(`Updated attendance record ${record.id} with schedule ${schedule.id}`);
      } else {
        console.warn(`No schedule found for subject ${record.subject_id} on ${dayOfWeek}`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

/**
 * Initialize database with your subjects and schedules
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database with subjects and schedules...');

    // Check if subjects already exist
    const existingSubjects = await Subject.count();
    if (existingSubjects > 0) {
      console.log('Subjects already exist, skipping initialization');
      return;
    }

    // Insert subjects
    const subjects = await Subject.bulkCreate([
      { code: 'AIS ELEC 4', name: 'Professional Elective 4', room: '104 B' },
      { code: 'AIS ELEC 5', name: 'Aviation Customer Relationship Management', room: '104 B' },
      { code: 'IS 411', name: 'Capstone Project 2', room: '104 B' },
      { code: 'IS 412', name: 'System Infrastructure and Integration', room: '104 B' },
      { code: 'IS 413', name: 'Advance Computer System', room: 'COMP LAB 4/104 B' },
      { code: 'IS 414', name: 'Management Info. System', room: '104 B' },
      { code: 'IS 416', name: 'Enterprise Architecture', room: '104 B' },
      { code: 'IS 422', name: 'Management and Organization Concept', room: '104 B' }
    ]);

    console.log('Subjects created successfully');

    // Insert schedules
    const scheduleData = [
      // AIS ELEC 4: M/W | 6:00PM-7:30PM
      { code: 'AIS ELEC 4', day: 'Monday', start: '18:00:00', end: '19:30:00' },
      { code: 'AIS ELEC 4', day: 'Wednesday', start: '18:00:00', end: '19:30:00' },
      
      // AIS ELEC 5: T/TH | 2:00PM-3:30PM
      { code: 'AIS ELEC 5', day: 'Tuesday', start: '14:00:00', end: '15:30:00' },
      { code: 'AIS ELEC 5', day: 'Thursday', start: '14:00:00', end: '15:30:00' },
      
      // IS 411: F | 1:00PM-4:00PM
      { code: 'IS 411', day: 'Friday', start: '13:00:00', end: '16:00:00' },
      
      // IS 412: T/TH | 3:30PM-5:00PM
      { code: 'IS 412', day: 'Tuesday', start: '15:30:00', end: '17:00:00' },
      { code: 'IS 412', day: 'Thursday', start: '15:30:00', end: '17:00:00' },
      
      // IS 413: M/W | 3:00PM-5:30PM (combined lab and lecture)
      { code: 'IS 413', day: 'Monday', start: '15:00:00', end: '17:30:00' },
      { code: 'IS 413', day: 'Wednesday', start: '15:00:00', end: '17:30:00' },
      
      // IS 414: M/W | 1:30PM-3:00PM
      { code: 'IS 414', day: 'Monday', start: '13:30:00', end: '15:00:00' },
      { code: 'IS 414', day: 'Wednesday', start: '13:30:00', end: '15:00:00' },
      
      // IS 416: F | 4:00PM-7:00PM
      { code: 'IS 416', day: 'Friday', start: '16:00:00', end: '19:00:00' },
      
      // IS 422: T/TH | 5:00PM-6:30PM
      { code: 'IS 422', day: 'Tuesday', start: '17:00:00', end: '18:30:00' },
      { code: 'IS 422', day: 'Thursday', start: '17:00:00', end: '18:30:00' }
    ];

    for (const sched of scheduleData) {
      const subject = subjects.find(s => s.code === sched.code);
      await SubjectSchedule.create({
        subject_id: subject.id,
        day_of_week: sched.day,
        start_time: sched.start,
        end_time: sched.end
      });
    }

    console.log('Schedules created successfully');
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  sequelize.authenticate()
    .then(async () => {
      console.log('Database connected successfully');
      
      if (command === 'init') {
        await initializeDatabase();
      } else if (command === 'migrate') {
        await migrate();
      } else {
        console.log('Usage:');
        console.log('  node scripts/migrate.js init     - Initialize database with subjects and schedules');
        console.log('  node scripts/migrate.js migrate  - Migrate existing attendance data');
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection error:', error);
      process.exit(1);
    });
}

export { migrate, initializeDatabase };