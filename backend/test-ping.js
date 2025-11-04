const { exec } = require('child_process');

const host = 'attendance-system.czykkgwyoyb7.ap-southeast-1.rds.amazonaws.com';

console.log(`Testing connectivity to: ${host}`);

// Try telnet on port 3306
exec(`telnet ${host} 3306`, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Cannot reach MySQL port 3306');
    console.log('This confirms the security group is blocking connections');
  } else {
    console.log('✅ Can reach MySQL port - issue might be authentication');
  }
});