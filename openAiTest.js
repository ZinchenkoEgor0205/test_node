require('dotenv').config();
const OpenAI = require("openai");
const readline = require('readline');
const fs = require('fs');

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

let defaultInstructions = "You are a property seller. Ask a person about his preferences. " +
    "If client mentions budget or currency or address or roomCount info return data in json format looking like" +
    '{"budget": "...", "currency": "...", "address": "...", "roomCount": 0} (without any comments if data is provided. just raw data)';

let userSessions = {};

async function createNewSession(userId) {
    const assistant = await openai.beta.assistants.create({
        name: `Property seller for ${userId}`,
        instructions: defaultInstructions,
        tools: [{type: "code_interpreter"}],
        model: "gpt-4o-mini",
        temperature: 0.9
    });

    const thread = await openai.beta.threads.create();
    const filters = {
        budget: '',
        currency: '',
        address: '',
        roomCount: 0
    };

    userSessions[userId] = { assistant, thread, filters };
}

async function sendMessage(userId, messageContent) {
    let assistantResponse = '';

    const userSession = userSessions[userId];
    const { assistant, thread } = userSession;

    return new Promise(async (resolve, reject) => {
        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: messageContent
            }
        );

        const run = openai.beta.threads.runs.stream(thread.id, {
            assistant_id: assistant.id
        })
            .on('textDelta', (textDelta) => {
                process.stdout.write(textDelta.value);
                assistantResponse += textDelta.value;
            })
            .on('end', () => {
                console.log(`\nassistantResponse for ${userId}: ` + assistantResponse);
                resolve(assistantResponse);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

const askQuestion = (userId, rl) => {
    rl.question(`${userId} > `, async (input) => {
        const assistantResponse = await sendMessage(userId, input);
        const userSession = userSessions[userId];
        const filters = userSession.filters;

        try {
            const parsedAnswer = JSON.parse(assistantResponse);
            if (parsedAnswer.budget || parsedAnswer.currency || parsedAnswer.address || parsedAnswer.roomCount) {
                Object.keys(parsedAnswer).forEach(key => {
                    if (key in filters) {
                        filters[key] = parsedAnswer[key];
                    }
                });

                const newInstructions = "You are a property seller. Ask the client for other preferences. " +
                    "Don't repeat your question. Don't point to preferences directly.";
                userSession.assistant = await openai.beta.assistants.create({
                    name: `Property seller for ${userId}`,
                    instructions: newInstructions,
                    tools: [{type: "code_interpreter"}],
                    model: "gpt-4o-mini",
                    temperature: 0.9
                });
                await sendMessage(userId, 'follow your new instructions');
            } else {
                console.log(`No filter data detected for ${userId}.`);
            }
        } catch (e) {
            console.log(`Response for ${userId} not in JSON format yet.`);
        }
        saveSessionsToFile()
        askQuestion(userId, rl);
    });
}

function saveSessionsToFile() {
    const sessionsData = JSON.stringify(userSessions, null, 2)
    fs.writeFileSync('userSessions.json', sessionsData, 'utf8')
}

function loadSessionsFromFile() {
    if (fs.existsSync('userSessions.json')) {
        const sessionsData = fs.readFileSync('userSessions.json', 'utf8');
        userSessions = JSON.parse(sessionsData);
    }
}

async function callAssistant(userId) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    if (!userSessions.hasOwnProperty(userId) || !Object.keys(userSessions).length) {
        await createNewSession(userId);
    }
    askQuestion(userId, rl)
}

loadSessionsFromFile();
module.exports = callAssistant