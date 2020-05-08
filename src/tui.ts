import { terminal } from "terminal-kit";
import { Client } from "./client";

/**
 * The terminal UI.
 */
export class TUI {
    private client: Client;
    private username: string;
    private password: string;

    public constructor(address: string, username: string, password: string) {
        terminal.dim(`Connecting to ${address}\n`);
        this.client = new Client(address);
        this.username = username;
        this.password = password;
        this.bind();
    }

    private bind(): void {
        terminal.on("key", (name: string) => {
            if (name === "CTRL_C") {
                terminal.grabInput(false);
                setTimeout(() => process.exit(), 100);
            }
        })

        this.client.on("ready", () => {
            terminal.dim(`Logging in as ${this.username}...\n`);
            this.client.send("server/login-request", [{
                username: this.username,
                password: this.password
            }]);
        });

        this.client.on("server/login-response", async resp => {
            if (resp.success) {
                terminal.green("Ready!\n");
                this.client.on("channel/send-message", (...msgs) => {
                    for (const msg of msgs) {
                        terminal.magenta(`<${msg.author}@${msg.channel}> ${msg.content}\n`);
                    }
                });

                // Enter REPL
                this.run();
            } else {
                terminal.red(`Login was unsuccessful: ${JSON.stringify(resp)}\n`);
            }
        })
    }

    public async run(): Promise<void> {
        while (true) {
            const line = await terminal.inputField({
                cursorPosition: 0
            }).promise;
            terminal.eraseLine().column(1);
            if (line) {
                this.client.send("channel/send-message", [{
                    author: "dummy", // TODO: This is deprecated, but not optional
                    channel: "default",
                    content: line
                }]);
            }
        }
    }
}
