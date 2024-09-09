require('dotenv').config();
const OpenAI = require("openai");
const readline = require('readline');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let instructions = "You are a property seller. " +
            "If client mentions budget info return only budget data with currency abbr that was mentioned in the message in json type looking like" +
            "{'budget': ..., 'currency': ...}"

async function main() {
    const assistant = await openai.beta.assistants.create({
        name: "Property seller",
        instructions: instructions,
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4o-mini"
    });

    const thread = await openai.beta.threads.create();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const sendMessage = async (messageContent) => {
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
            .on('textCreated', (text) => process.stdout.write('\nassistant > '))
            .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
            .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
            .on('toolCallDelta', (toolCallDelta, snapshot) => {
                if (toolCallDelta.type === 'code_interpreter') {
                    if (toolCallDelta.code_interpreter.input) {
                        process.stdout.write(toolCallDelta.code_interpreter.input);
                    }
                    if (toolCallDelta.code_interpreter.outputs) {
                        process.stdout.write("\noutput >\n");
                        toolCallDelta.code_interpreter.outputs.forEach(output => {
                            if (output.type === "logs") {
                                process.stdout.write(`\n${output.logs}\n`);
                            }
                        });
                    }
                }
            });
    };

    const askQuestion = () => {
        rl.question('You > ', (input) => {
            sendMessage(input);
            askQuestion();
        });
    };

    askQuestion();
}

main();
