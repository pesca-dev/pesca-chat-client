import * as readline from "readline";
import { Client } from "./client";
import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({
    addHelp: true,
    description: "CLI client for the socket chat app"
});
parser.addArgument("username", {
    help: "Your username"
});
parser.addArgument("password", {
    help: "Your password"
});
parser.addArgument(["-a", "--address"], {
    required: false,
    defaultValue: "ws://localhost:3000",
    help: "The URL of the server"
});

async function main(): Promise<void> {
    const args = parser.parseArgs();
    const client = new Client(args.address);

    client.on("ready", () => {
        console.log(`Logging in as ${args.username}...`);
        client.send("server/login-request", [{
            username: args.username,
            password: args.password
        }]);
    });

    client.on("server/login-response", resp => {
        if (resp.success) {
            console.log("Ready!");
            client.on("channel/send-message", (...msgs) => {
                for (const msg of msgs) {
                    console.log(`<${msg.author}@${msg.channel}> ${msg.content}`);
                }
            });
            
            const cli = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            cli.on("line", line => {
                client.send("channel/send-message", [{
                    author: "dummy", // TODO: This is deprecated, but not optional
                    channel: "default",
                    content: line
                }]);
                cli.prompt();
            });
            cli.prompt();
        } else {
            console.log(`Login was unsuccessful: ${JSON.stringify(resp)}`);
        }
    })
}

main().catch(e => console.error(e));
