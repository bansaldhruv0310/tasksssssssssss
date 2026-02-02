const { execSync } = require('child_process');
const dotenv = require('dotenv');
const OpenAI = require('openai').default;
const readline = require('readline');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Branching Strategy:
// DEV → feature/* branches
// UAT → release/* branches
// PROD → main branch

const PROTECTED_BRANCHES = ['main', 'uat', 'dev'];
const BRANCH_PATTERNS = {
    feature: /^feature\/.+/,
    release: /^release\/.+/,
    hotfix: /^hotfix\/.+/
};

async function getAIExplanation(violation) {
    try {
        console.log('\n🤖 Asking AI Safety Bot for guidance...\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful Git Safety Bot that explains branching strategy violations in a friendly, educational way. Keep responses concise (2-3 sentences).'
                },
                {
                    role: 'user',
                    content: `Explain why this is a problem: ${violation}`
                }
            ],
            max_tokens: 150
        });

        const explanation = response.choices[0].message.content.trim();

        console.log('--------- 🤖 AI Safety Bot ---------');
        console.log(explanation);
        console.log('------------------------------------\n');

    } catch (error) {
        console.log('⚠️  Could not reach AI Safety Bot (continuing with standard message)\n');
    }
}

async function main() {
    // Get current branch
    let currentBranch;
    try {
        currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch (error) {
        console.log('⚠️  Could not determine current branch');
        process.exit(0); // Allow commit if we can't determine branch
    }


    // --- CHECK 0: BLOCK CHERRY-PICK ---
    try {
        const gitDir = execSync('git rev-parse --git-dir').toString().trim();
        const cherryPickHead = require('path').join(gitDir, 'CHERRY_PICK_HEAD');
        if (require('fs').existsSync(cherryPickHead)) {
            console.log('\n❌ BLOCKED: Cherry-picking is restricted in this repository!');
            await getAIExplanation("User tried to git cherry-pick. This is disabled to prevent history fragmentation.");
            process.exit(1);
        }
    } catch (e) { }

    console.log(`\n📋 Branch: ${currentBranch}`);



    // Check 1: Prevent direct commits to protected branches
    if (PROTECTED_BRANCHES.includes(currentBranch)) {
        console.log(`\n❌ Direct commits to '${currentBranch}' are not allowed!\n`);

        await getAIExplanation(
            `Developer tried to commit directly to ${currentBranch} branch. Our branching strategy requires: DEV→feature/*, UAT→release/*, PROD→main.`
        );

        // Force TTY on Windows if needed
        let inputStream = process.stdin;
        let outputStream = process.stdout;

        if (!process.stdin.isTTY && process.platform === 'win32') {
            try {
                const fs = require('fs');
                inputStream = fs.createReadStream('\\\\.\\CONIN$');
                outputStream = fs.createWriteStream('\\\\.\\CONOUT$');
            } catch (e) {
                console.warn('⚠️  Could not force TTY:', e.message);
            }
        }

        const rl = readline.createInterface({
            input: inputStream,
            output: outputStream,
            terminal: true // Force TTY behavior for proper line reading
        });

        const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

        try {
            const fix = await askQuestion(`\n🛠️  Would you like to move these changes to a new branch automatically? (y/n): `);

            if (fix && (fix.toLowerCase() === 'y' || fix.toLowerCase() === 'yes')) {
                const defaultName = `feature/fix-${Date.now()}`;
                console.log(`\nSuggested name: ${defaultName}`);
                const customName = await askQuestion(`Enter branch name (press Enter for default): `);
                const branchName = customName.trim() || defaultName;

                console.log(`\n🔄 Switching to branch '${branchName}'...`);
                execSync(`git checkout -b ${branchName}`);

                const push = await askQuestion(`🚀 Push this new branch to remote now? (y/n): `);
                if (push && (push.toLowerCase() === 'y' || push.toLowerCase() === 'yes')) {
                    console.log(`☁️  Pushing to origin/${branchName}...`);
                    execSync(`git push -u origin ${branchName}`);
                }

                console.log(`\n✅ Success! You are now on '${branchName}'.`);
                console.log(`📝 Please run your commit command again:\n`);
                console.log(`   git commit -m "..."\n`);

                rl.close();
                process.exitCode = 1;
                return;
            } else {
                rl.close();
                process.exitCode = 1;
            }
        } catch (err) {
            console.log('Error during auto-fix:', err.message);
            rl.close();
        }

        console.log('✅ Correct workflow:');
        if (currentBranch === 'main') {
            console.log('   1. Create release branch: git checkout -b release/v1.0');
            console.log('   2. Merge to UAT first, then PROD');
        } else if (currentBranch === 'uat') {
            console.log('   1. Create release branch: git checkout -b release/v1.0');
            console.log('   2. Make changes and create PR to UAT');
        } else if (currentBranch === 'dev') {
            console.log('   1. Create feature branch: git checkout -b feature/my-feature');
            console.log('   2. Make changes and create PR to DEV');
        }
        console.log('');
        process.exitCode = 1;
        return;
    }

    // Check 2: Validate branch naming conventions
    const isValidBranch = Object.values(BRANCH_PATTERNS).some(pattern => pattern.test(currentBranch));

    if (!isValidBranch && !PROTECTED_BRANCHES.includes(currentBranch)) {
        console.log(`\n⚠️  Branch '${currentBranch}' doesn't follow naming conventions\n`);

        await getAIExplanation(
            `Developer is using branch '${currentBranch}' which doesn't follow our naming conventions (feature/*, release/*, hotfix/*).`
        );

        console.log('📋 Required branch naming:');
        console.log('   • feature/*  - For new features (merges to DEV)');
        console.log('   • release/*  - For releases (merges to UAT)');
        console.log('   • hotfix/*   - For urgent fixes (merges to PROD)');
        console.log('\n💡 Tip: Rename your branch with:');
        console.log(`   git branch -m feature/${currentBranch}\n`);

        process.exit(1);
    }

    // Check 3: Validate user identity
    let userEmail;
    try {
        userEmail = execSync('git config user.email').toString().trim();
    } catch (error) {
        console.log('\n❌ Git user email not configured!\n');
        console.log('Set your email with:');
        console.log('   git config user.email "your.email@example.com"\n');
        process.exit(1);
    }

    if (!userEmail || !userEmail.includes('@')) {
        console.log('\n❌ Invalid git user email!\n');
        console.log('Set a valid email with:');
        console.log('   git config user.email "your.email@example.com"\n');
        process.exit(1);
    }

    console.log(`✅ All checks passed! Committing as ${userEmail}\n`);
    process.exit(0);
}

main();
