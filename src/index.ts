import { ArgumentParser } from "argparse";
import { terminal } from "terminal-kit";
import { Client } from "./client";

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

    terminal.on("key", (name: string) => {
        if (name === "CTRL_C") {
            terminal.grabInput(false);
            setTimeout(() => process.exit(), 100);
        }
    })

    client.on("ready", () => {
        terminal.dim(`Logging in as ${args.username}...\n`);
        client.send("server/login-request", [{
            username: args.username,
            password: args.password
        }]);
    });

    client.on("server/login-response", async resp => {
        if (resp.success) {
            terminal.green("Ready!\n");
            client.on("channel/send-message", (...msgs) => {
                for (const msg of msgs) {
                    terminal.magenta(`<${msg.author}@${msg.channel}> ${msg.content}\n`);
                }
            });

            // Enter REPL
            while (true) {
                const line = await terminal.inputField({
                    cursorPosition: 0
                }).promise;
                terminal.eraseLine().column(1);
                if (line) {
                    client.send("channel/send-message", [{
                        author: "dummy", // TODO: This is deprecated, but not optional
                        channel: "default",
                        content: line
                    }]);
                }
            }
        } else {
            terminal.red(`Login was unsuccessful: ${JSON.stringify(resp)}\n`);
        }
    })
}

main().catch(e => console.error(e));
