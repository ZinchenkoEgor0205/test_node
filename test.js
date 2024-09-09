require('dotenv').config();
console.log(process.env.OPENAI_API_KEY)

const OpenAI = require("openai")
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

async function main() {
    const assistant = await openai.beta.assistants.create({
        name: "Property seller",
        instructions: "You are a property seller. " +
            "If client mentions budget info return only budget data with currency abbr that was mentioned in the message in json type",
        tools: [{type: "code_interpreter"}],
        model: "gpt-4o-mini"
    });

    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: "I need to buy a car for 50000 eur can you help me"
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
}

main();
