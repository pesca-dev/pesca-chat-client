import { ArgumentParser } from "argparse";
import { TUI } from "./tui";

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
    const tui = await TUI.connect(args.address, args.username, args.password);
    await tui.run();
}

main().catch(e => console.error(e));
