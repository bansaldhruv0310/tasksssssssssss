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

// ANSI Colors & Styles
const C = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Cyan: "\x1b[36m",
    White: "\x1b[37m",
    BgRed: "\x1b[41m",
};

// Helper to exit cleanly on Windows (prevents UV_HANDLE_CLOSING assertion failed)
function safeExit(code) {
    // Add a small delay to allow stdout/stderr pipes to flush fully on Windows
    setTimeout(() => {
        process.exit(code);
    }, 500);
}

async function getAIExplanation(violation) {
    try {
        console.log(`\n${C.Cyan}${C.Bright}🤖  ASKING AI SAFETY BOT...${C.Reset}\n`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: (() => {
                        const personas = [
                            "You are a strict Git Safety Bot. Warn about stability risks in 1 short sentence.",
                            "You are a wise Software Architect. Briefly explain the 'why' using a simple analogy.",
                            "You are a DevOps Guardian. Warn about breaking the CI/CD pipeline and blocking teammates.",
                            "You are a Code Quality Auditor. Mention the risk of technical debt and unreviewed code.",
                            "You are a helpful Mentor. Gently correct the mistake and explain the benefit of the process."
                        ];
                        const selected = personas[Math.floor(Math.random() * personas.length)];
                        return `${selected} Then, strictly show the correct flow: "Use Feature -> Release -> Main". Keep it under 3 lines total.`;
                    })()
                },
                {
                    role: 'user',
                    content: `Explain why this is a problem and what to do instead: ${violation}`
                }
            ],
            max_tokens: 250
        }, { signal: controller.signal });

        clearTimeout(timeout);

        const explanation = response.choices[0].message.content.trim();

        // Beautified Box Output
        console.log(`${C.Cyan}╔════════════════════════════════════════════════════════════╗${C.Reset}`);
        console.log(`${C.Cyan}║                  🤖 AI SAFETY BOT ADVICE                   ║${C.Reset}`);
        console.log(`${C.Cyan}╠════════════════════════════════════════════════════════════╣${C.Reset}`);

        // Split explanation by newlines to print neatly
        explanation.split('\n').forEach(line => {
            console.log(`${C.Cyan}║${C.Reset}  ${line}`);
        });

        console.log(`${C.Cyan}╚════════════════════════════════════════════════════════════╝${C.Reset}\n`);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`${C.Yellow}⚠️  AI Safety Bot timed out.${C.Reset}`);
        } else {
            console.log(`${C.Yellow}⚠️  Could not reach AI Safety Bot: ${error.message}${C.Reset}\n`);
        }
    }
}

async function main() {
    // Read stdin to get push details
    // Format: <local_ref> <local_oid> <remote_ref> <remote_oid>
    const input = fs.readFileSync(0, 'utf-8').trim();

    // If no input (e.g. running manually without pipe), fall back to git command or exit
    if (!input) {
        safeExit(0);
    }

    const lines = input.split('\n');
    let hasError = false;

    // Header
    console.log(`\n${C.Blue}╔═══════════════════ GIT SAFETY PLATFORM ══════════════════╗${C.Reset}`);

    for (const line of lines) {
        if (!line.trim()) continue;
        const [localRef, localOid, remoteRef, remoteOid] = line.split(' ');

        // Extract branch names (e.g., refs/heads/main -> main)
        const sourceBranch = localRef.replace('refs/heads/', '');
        const targetBranch = remoteRef.replace('refs/heads/', '');

        console.log(`${C.Blue}║${C.Reset}  Validating: ${C.Yellow}${sourceBranch}${C.Reset} ➜ ${C.Yellow}${targetBranch}${C.Reset}`);

        // --- BRANCHING RULES ---

        // 1. Block feature/* -> main
        if (sourceBranch.startsWith('feature/') && targetBranch === 'main') {
            console.log(`${C.Blue}╠════════════════════════════════════════════════════════════╣${C.Reset}`);
            console.log(`${C.Blue}║${C.Reset}  ${C.BgRed}${C.White} ⛔ BLOCKED ${C.Reset} Feature branch cannot go directly to 'main'.`);
            await getAIExplanation("Pushing a feature branch directly to main. It should go to a release branch first.");
            hasError = true;
        }

        // 2. Block direct pushes to main (unless from release/*)
        else if (targetBranch === 'main' && !sourceBranch.startsWith('release/')) {
            console.log(`${C.Blue}╠════════════════════════════════════════════════════════════╣${C.Reset}`);
            console.log(`${C.Blue}║${C.Reset}  ${C.BgRed}${C.White} ⛔ BLOCKED ${C.Reset} Direct push to 'main' is restricted.`);
            await getAIExplanation(`Direct push to main from ${sourceBranch}. Only release branches can be pushed/merged to main.`);
            hasError = true;
        }

        else if (sourceBranch.startsWith('release/') && targetBranch === 'main') {
            console.log(`${C.Blue}║${C.Reset}  ${C.Green}✅ ALLOWED${C.Reset} Promoting release to main.`);
        }

        else if (sourceBranch.startsWith('feature/') && targetBranch.startsWith('release/')) {
            console.log(`${C.Blue}║${C.Reset}  ${C.Green}✅ ALLOWED${C.Reset} Merging feature into release.`);
        }

        else if (sourceBranch === targetBranch && (sourceBranch.startsWith('feature/') || sourceBranch.startsWith('bugfix/'))) {
            console.log(`${C.Blue}║${C.Reset}  ${C.Green}✅ ALLOWED${C.Reset} Updating feature branch.`);
        }

        else if (targetBranch === 'main') {
            console.log(`${C.Blue}╠════════════════════════════════════════════════════════════╣${C.Reset}`);
            console.log(`${C.Blue}║${C.Reset}  ${C.BgRed}${C.White} ⛔ BLOCKED ${C.Reset} Unknown branch pushing to 'main'.`);
            hasError = true;
        }
    }

    console.log(`${C.Blue}╚════════════════════════════════════════════════════════════╝${C.Reset}\n`);

    if (hasError) {
        safeExit(1);
    } else {
        safeExit(0);
    }
}

main();
