-- Database: attendance_system
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    section VARCHAR(50) NOT NULL,
    year_level VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_section (section),
    INDEX idx_active (is_active)
);

-- Subjects Table with separate day and time columns
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- Subject Schedules Table (supports multiple schedules per subject)
CREATE TABLE subject_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_subject_day (subject_id, day_of_week),
    INDEX idx_day_time (day_of_week, start_time)
);

-- Attendance Table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_number VARCHAR(20) NOT NULL,
    subject_id INT NOT NULL,
    schedule_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    remarks TEXT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marked_by INT,
    -- Prevent duplicate entries
    UNIQUE KEY unique_attendance (student_number, subject_id, date),
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES subject_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_student_subject_date (student_number, subject_id, date),
    INDEX idx_date_subject (date, subject_id),
    INDEX idx_student_date (student_number, date),
    INDEX idx_status (status),
    INDEX idx_schedule_date (schedule_id, date)
);

-- Admin Table
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username)
);

-- Insert your subjects based on the certificate
INSERT INTO subjects (code, name, room) VALUES
('AIS ELEC 4', 'Professional Elective 4', '104 B'),
('AIS ELEC 5', 'Aviation Customer Relationship Management', '104 B'),
('IS 411', 'Capstone Project 2', '104 B'),
('IS 412', 'System Infrastructure and Integration', '104 B'),
('IS 413', 'Advance Computer System', 'COMP LAB 4/104 B'),
('IS 414', 'Management Info. System', '104 B'),
('IS 416', 'Enterprise Architecture', '104 B'),
('IS 422', 'Management and Organization Concept', '104 B');

-- Insert schedules for your subjects
-- AIS ELEC 4: M/W | 6:00PM-7:30PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Monday', '18:00:00', '19:30:00' FROM subjects WHERE code = 'AIS ELEC 4'
UNION ALL
SELECT id, 'Wednesday', '18:00:00', '19:30:00' FROM subjects WHERE code = 'AIS ELEC 4';

-- AIS ELEC 5: T/TH | 2:00PM-3:30PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Tuesday', '14:00:00', '15:30:00' FROM subjects WHERE code = 'AIS ELEC 5'
UNION ALL
SELECT id, 'Thursday', '14:00:00', '15:30:00' FROM subjects WHERE code = 'AIS ELEC 5';

-- IS 411: F | 1:00PM-4:00PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Friday', '13:00:00', '16:00:00' FROM subjects WHERE code = 'IS 411';

-- IS 412: T/TH | 3:30PM-5:00PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Tuesday', '15:30:00', '17:00:00' FROM subjects WHERE code = 'IS 412'
UNION ALL
SELECT id, 'Thursday', '15:30:00', '17:00:00' FROM subjects WHERE code = 'IS 412';

-- IS 413: M/W | 4:30PM-5:30PM (Lecture) and 3:00PM-4:30PM (Lab)
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Monday', '15:00:00', '16:30:00' FROM subjects WHERE code = 'IS 413'
UNION ALL
SELECT id, 'Wednesday', '15:00:00', '16:30:00' FROM subjects WHERE code = 'IS 413'
UNION ALL
SELECT id, 'Monday', '16:30:00', '17:30:00' FROM subjects WHERE code = 'IS 413'
UNION ALL
SELECT id, 'Wednesday', '16:30:00', '17:30:00' FROM subjects WHERE code = 'IS 413';

-- IS 414: M/W | 1:30PM-3:00PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Monday', '13:30:00', '15:00:00' FROM subjects WHERE code = 'IS 414'
UNION ALL
SELECT id, 'Wednesday', '13:30:00', '15:00:00' FROM subjects WHERE code = 'IS 414';

-- IS 416: F | 4:00PM-7:00PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Friday', '16:00:00', '19:00:00' FROM subjects WHERE code = 'IS 416';

-- IS 422: T/TH | 5:00PM-6:30PM
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time)
SELECT id, 'Tuesday', '17:00:00', '18:30:00' FROM subjects WHERE code = 'IS 422'
UNION ALL
SELECT id, 'Thursday', '17:00:00', '18:30:00' FROM subjects WHERE code = 'IS 422';