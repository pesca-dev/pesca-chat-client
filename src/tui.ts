import { terminal } from "terminal-kit";
import { Client } from "./client";

/**
 * A terminal UI.
 */
export class TUI {
    /**
     * Creates a new terminal UI and asynchronously connects
     * with the given credentials to the given address.
     * Resolves once the connection is in a ready state.
     */
    public static async connect(address: string, username: string, password: string): Promise<TUI> {
        const tui = new TUI(address, username, password);
        await tui.bind();
        return tui;
    }

    private client: Client;
    private username: string;
    private password: string;

    private constructor(address: string, username: string, password: string) {
        terminal.dim(`Connecting to ${address}\n`);
        this.client = new Client(address);
        this.username = username;
        this.password = password;
    }

    private async bind(): Promise<void> {
        return new Promise((resolve, reject) => {
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
                    resolve();
                } else {
                    terminal.red(`Login was unsuccessful: ${JSON.stringify(resp)}\n`);
                    reject(resp);
                }
            })
        });
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
