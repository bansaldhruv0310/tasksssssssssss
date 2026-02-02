const { execSync } = require('child_process');
const dotenv = require('dotenv');
const OpenAI = require('openai').default;
const fs = require('fs');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getAIExplanation(violation) {
    try {
        console.log('\n🤖 Asking AI Safety Bot for guidance...\n');
        // Using a short timeout to prevent hanging if API is slow
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful Git Safety Bot. Explain why a specific branching rule violation is dangerous. Be concise.'
                },
                {
                    role: 'user',
                    content: `Explain why this is a problem and what to do instead: ${violation}`
                }
            ],
            max_tokens: 150
        }, { signal: controller.signal });

        clearTimeout(timeout);

        const explanation = response.choices[0].message.content.trim();
        console.log('--------- 🤖 AI Safety Bot ---------');
        console.log(explanation);
        console.log('------------------------------------\n');

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('⚠️  AI Safety Bot timed out.');
        } else {
            console.log('⚠️  Could not reach AI Safety Bot (continuing with block message)\n');
        }
    }
}

async function main() {
    // Read stdin to get push details
    // Format: <local_ref> <local_oid> <remote_ref> <remote_oid>
    const input = fs.readFileSync(0, 'utf-8').trim();

    // If no input (e.g. running manually without pipe), fall back to git command or exit
    if (!input) {
        // Fallback for manual testing or weird git clients
        // existing logic could go here, but for pre-push stdin is standard
        process.exit(0);
    }

    const lines = input.split('\n');
    let hasError = false;

    for (const line of lines) {
        if (!line.trim()) continue;
        const [localRef, localOid, remoteRef, remoteOid] = line.split(' ');

        // Extract branch names (e.g., refs/heads/main -> main)
        const sourceBranch = localRef.replace('refs/heads/', '');
        const targetBranch = remoteRef.replace('refs/heads/', '');

        console.log(`\n📋 Validating Push: ${sourceBranch} ➜ ${targetBranch}`);

        // --- BRANCHING RULES ---

        // 1. Block feature/* -> main
        if (sourceBranch.startsWith('feature/') && targetBranch === 'main') {
            console.log(`\n❌ BLOCKED: Feature branch '${sourceBranch}' cannot be pushed directly to 'main'.`);
            await getAIExplanation("Pushing a feature branch directly to main. It should go to a release branch first.");
            hasError = true;
        }

        // 2. Block direct pushes to main (unless from release/*)
        else if (targetBranch === 'main' && !sourceBranch.startsWith('release/')) {
            console.log(`\n❌ BLOCKED: Direct push to 'main' from '${sourceBranch}' is restricted.`);
            await getAIExplanation(`Direct push to main from ${sourceBranch}. Only release branches can be pushed/merged to main.`);
            hasError = true;
        }

        // 3. Block feature/* -> anything OTHER than release/* or feature/* (Generic safety)
        // (Optional strictness, but let's stick to user request: Feature -> Release allowed)
        // User said: "feature to main block, feature to release allow"

        // 4. Validate release/* -> main (Allowed, checking just in case of other rules)
        else if (sourceBranch.startsWith('release/') && targetBranch === 'main') {
            console.log(`✅ Allowed: Promoting release '${sourceBranch}' to 'main'.`);
        }

        else if (sourceBranch.startsWith('feature/') && targetBranch.startsWith('release/')) {
            console.log(`✅ Allowed: Merging feature '${sourceBranch}' into release '${targetBranch}'.`);
        }

        else if (sourceBranch === targetBranch && (sourceBranch.startsWith('feature/') || sourceBranch.startsWith('bugfix/'))) {
            // Allow updating own feature branch
            console.log(`✅ Allowed: Updating feature branch '${sourceBranch}'.`);
        }

        else if (targetBranch === 'main') {
            // Catch-all for main protection
            console.log(`\n❌ BLOCKED: Unknown branch '${sourceBranch}' trying to push to 'main'.`);
            hasError = true;
        }
    }

    if (hasError) {
        console.log('⛔ Push rejected by Safety Platform.');
        process.exit(1);
    } else {
        process.exit(0);
    }
}

main();
