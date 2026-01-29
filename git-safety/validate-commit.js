const { execSync } = require('child_process');

try {
    const branch = execSync('git symbolic-ref --short HEAD').toString().trim();
    const email = execSync('git config user.email').toString().trim();

    // Rule 1: No direct commits to main
    if (branch === 'main' || branch === 'master') {
        console.error('\x1b[31m%s\x1b[0m', '❌ Direct commits to main/master are blocked over GIT SAFETY ENGINE.');
        console.error('Please create a feature branch and use a Pull Request.');
        process.exit(1);
    }

    // Rule 2: Identity Validation (Mock)
    if (!email.includes('@')) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Invalid git config user.email.');
        process.exit(1);
    }

    console.log('\x1b[32m%s\x1b[0m', '✅ Git Safety Checks Passed');
    process.exit(0);

} catch (error) {
    console.error('Error running git safety checks:', error);
    process.exit(1);
}
