import * as proto from "socket-chat-protocol";
import { Client } from "./client";

/** A command in the TUI. */
export interface Command {
    invoke(args: string, client: Client): Promise<void>;
}

/** A command that sends a channel action (such as join/leave/...). */
export class ChannelActionCommand implements Command {
    private action: proto.Server.ChannelActionEvent;

    public constructor(action: proto.Server.ChannelActionEvent) {
        this.action = action;
    }

    public async invoke(args: string, client: Client): Promise<void> {
        const req: proto.Client.ChannelActionRequest<proto.Server.ChannelActionEvent> = {
            action: this.action,
            channel: args
        };
        await client.sendAny(`channel/${this.action}-request`, [req]);
    }
}
