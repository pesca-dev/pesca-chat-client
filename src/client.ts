import { EventEmitter } from "events";
import * as proto from "socket-chat-protocol";
import WebSocket from "ws";

export declare interface Client {
    on<K extends keyof proto.Client.Event>(event: "ready" | K, listener: (...params: proto.Client.Event[K]) => void): this;
}

/** The socket chat client. */
export class Client extends EventEmitter {
    private ws: WebSocket;

    constructor(address: string) {
        super();
        this.ws = new WebSocket(address);
        this.bind();
    }

    /** Bind events. */
    private bind(): void {
        this.ws.on("open", () => this.emit("ready"));
        this.ws.on("message", data => {
            // TODO: Handle non-string messages
            const message: proto.Server.EventObject<any> = JSON.parse(data.toString());
            this.emit(message.method, ...message.params);
        });
    }

    public send<K extends keyof proto.Server.Event>(method: K, params: proto.Server.Event[K]): void {
        this.ws.send(JSON.stringify({ method, params }));
    }
}
