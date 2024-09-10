require('dotenv').config();
const OpenAI = require("openai");
const readline = require('readline');

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

let instructions = "You are a property seller. Ask a person about his preferences" +
    "If client mentions budget or currency or address or roomCount info return data in json format looking like" +
    '{"budget": "...", "currency": "...", "address": "...", "roomCount": 0} (without any comments if data is provided. just raw data)';

let assistantResponse = '';

const filters = {
    budget: '',
    currency: '',
    address: '',
    roomCount: 0
}
let assistant
async function main() {
    assistant = await openai.beta.assistants.create({
        name: "Property seller",
        instructions: instructions,
        tools: [{type: "code_interpreter"}],
        model: "gpt-4o-mini",
        temperature: 0.9
    });

    const thread = await openai.beta.threads.create();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const sendMessage = async (messageContent) => {
        assistantResponse = '';

        // Set up a promise that resolves when the stream ends
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
                    assistantResponse += textDelta.value;  // Append the response text
                })
                .on('end', () => {
                    console.log('\nassistantResponse  +++ ' + assistantResponse);
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    };

    const askQuestion = () => {
        rl.question('You > ', async (input) => {
            await sendMessage(input);
            try {
                const parsedAnswer = JSON.parse(assistantResponse);
                if (parsedAnswer.budget || parsedAnswer.currency || parsedAnswer.address || parsedAnswer.roomCount) {
                    Object.keys(parsedAnswer).forEach(key => {
                        if (key in filters) {
                            filters[key] = parsedAnswer[key];
                        }
                    });
                    instructions = "You are a property seller. Ask the client for other preferences. Don't repeat your question. Don't point to preferences directly.";
                    const newAssistant = await openai.beta.assistants.create({
                        name: "Property seller",
                        instructions: instructions,
                        tools: [{type: "code_interpreter"}],
                        model: "gpt-4o-mini",
                        temperature: 0.9
                    });
                    assistant = newAssistant;
                    await sendMessage('follow your new instructions');
                } else {
                    console.log('No filter data detected.');
                }
            } catch (e) {
                console.log('Response not in JSON format yet.');
            }
            assistantResponse = '';
            askQuestion();
        });
    };

    askQuestion();
}

main();
