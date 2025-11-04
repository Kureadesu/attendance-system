const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'attendance-system.czykkgwyoyb7.ap-southeast-1.rds.amazonaws.com',
  user: 'root',
  password: 'kUreadesu3',
  port: 3306
});

console.log('Attempting to connect to RDS...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('Error details:', err);
  } else {
    console.log('✅ Connected to RDS successfully!');
    
    // Test a simple query
    connection.query('SELECT 1 + 1 AS solution', (err, results) => {
      if (err) {
        console.error('Query failed:', err);
      } else {
        console.log('Query test passed:', results);
      }
      connection.end();
    });
  }
});