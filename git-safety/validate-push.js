const { execSync } = require('child_process');
const dotenv = require('dotenv');
const OpenAI = require('openai').default;

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Protected branches that cannot be pushed to directly
const PROTECTED_BRANCHES = ['main', 'uat', 'dev'];

async function getAIExplanation(violation) {
    try {
        console.log('\n🤖 Asking AI Safety Bot for guidance...\n');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful Git Safety Bot that explains why direct pushes to protected branches are dangerous. Keep responses concise (2-3 sentences).'
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
        process.exit(0); // Allow push if we can't determine branch
    }

    console.log(`\n📋 Pushing to branch: ${currentBranch}`);

    // Check if pushing to protected branch
    if (PROTECTED_BRANCHES.includes(currentBranch)) {
        console.log(`\n❌ Direct push to '${currentBranch}' is not allowed!\n`);

        await getAIExplanation(
            `Developer tried to push directly to ${currentBranch} branch. This bypasses code review and can break the ${currentBranch.toUpperCase()} environment.`
        );

        console.log('✅ Correct workflow:');
        console.log('   1. Push your feature/release branch');
        console.log('   2. Create a Pull Request on GitHub');
        console.log('   3. Get code review approval');
        console.log('   4. Merge via PR (not direct push)\n');
        console.log('💡 Example:');
        console.log('   git push origin feature/my-feature');
        console.log('   # Then create PR on GitHub\n');

        process.exit(1);
    }

    console.log(`✅ Push to '${currentBranch}' allowed!\n`);
    process.exit(0);
}

main();
