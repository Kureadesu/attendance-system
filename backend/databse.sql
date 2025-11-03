-- Drop and recreate database with simplified exemption structure
DROP DATABASE IF EXISTS attendance_system;
CREATE DATABASE attendance_system;
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

-- Subjects Table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- Subject Schedules Table
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

-- FIXED: Exemptions Table with SIMPLIFIED unique constraint
CREATE TABLE exemptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    schedule_id INT NULL,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    exempted_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- SIMPLIFIED: One exemption per subject per date
    UNIQUE KEY unique_exemption_subject_date (subject_id, date),
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES subject_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (exempted_by) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_date_subject (date, subject_id),
    INDEX idx_schedule (schedule_id)
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

-- Attendance Logs Table
CREATE TABLE attendance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    action ENUM('create', 'update', 'delete', 'exempt') NOT NULL,
    student_number VARCHAR(20),
    subject_id INT,
    schedule_id INT,
    date DATE,
    old_status ENUM('present', 'absent', 'late'),
    new_status ENUM('present', 'absent', 'late'),
    remarks TEXT,
    performed_by INT NOT NULL,
    ip_address VARCHAR(45),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_number) REFERENCES students(student_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES subject_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES admins(id) ON DELETE CASCADE,
    
    INDEX idx_action_logged_at (action, logged_at),
    INDEX idx_student_logged_at (student_number, logged_at),
    INDEX idx_subject_logged_at (subject_id, logged_at),
    INDEX idx_performed_by (performed_by)
);

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, password_hash, full_name) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator');

-- Insert subjects
INSERT INTO subjects (code, name, room) VALUES
('AIS ELEC 4', 'Professional Elective 4', '104 B'),
('AIS ELEC 5', 'Aviation Customer Relationship Management', '104 B'),
('IS 411', 'Capstone Project 2', '104 B'),
('IS 412', 'System Infrastructure and Integration', '104 B'),
('IS 413', 'Advance Computer System', 'COMP LAB 4/104 B'),
('IS 414', 'Management Info. System', '104 B'),
('IS 416', 'Enterprise Architecture', '104 B'),
('IS 422', 'Management and Organization Concept', '104 B');

-- Insert schedules
INSERT INTO subject_schedules (subject_id, day_of_week, start_time, end_time) VALUES
-- AIS ELEC 4: M/W | 6:00PM-7:30PM
(1, 'Monday', '18:00:00', '19:30:00'),
(1, 'Wednesday', '18:00:00', '19:30:00'),

-- AIS ELEC 5: T/TH | 2:00PM-3:30PM
(2, 'Tuesday', '14:00:00', '15:30:00'),
(2, 'Thursday', '14:00:00', '15:30:00'),

-- IS 411: F | 1:00PM-4:00PM
(3, 'Friday', '13:00:00', '16:00:00'),

-- IS 412: T/TH | 3:30PM-5:00PM
(4, 'Tuesday', '15:30:00', '17:00:00'),
(4, 'Thursday', '15:30:00', '17:00:00'),

-- IS 413: M/W | Lab: 3:00PM-4:30PM, Lecture: 4:30PM-5:30PM
(5, 'Monday', '15:00:00', '16:30:00'),
(5, 'Wednesday', '15:00:00', '16:30:00'),
(5, 'Monday', '16:30:00', '17:30:00'),
(5, 'Wednesday', '16:30:00', '17:30:00'),

-- IS 414: M/W | 1:30PM-3:00PM
(6, 'Monday', '13:30:00', '15:00:00'),
(6, 'Wednesday', '13:30:00', '15:00:00'),

-- IS 416: F | 4:00PM-7:00PM
(7, 'Friday', '16:00:00', '19:00:00'),

-- IS 422: T/TH | 5:00PM-6:30PM
(8, 'Tuesday', '17:00:00', '18:30:00'),
(8, 'Thursday', '17:00:00', '18:30:00');