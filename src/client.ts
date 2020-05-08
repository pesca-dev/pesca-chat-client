import * as proto from "socket-chat-protocol";
import { EventEmitter } from "events";
import WebSocket from "ws";

// TODO: Figure out how to strongly type the 'on' function without causing
//       rest arguments in the listener's parameters to be incorrectly detected
//       as an array by TypeScript.

// export declare interface Client {
//     on<K extends keyof proto.Client.Event>(event: "ready" | K, listener: (...params: proto.Client.Event[K][]) => void): this;
// }

/** The socket chat client. */
export class Client extends EventEmitter {
    private ws: WebSocket;

    constructor(address: string) {
        super();
        console.log(`Connecting to ${address}`);
        this.ws = new WebSocket(address);
        this.bind();
    }
    
    /** Bind events. */
    private bind(): void {
        this.ws.on("open", () => this.emit("ready"));
        this.ws.on("message", data => {
            // TODO: Handle non-string messages
            let message: proto.Server.EventObject<any> = JSON.parse(data.toString());
            this.emit(message.method, ...message.params);
        });
    }
    
    send<K extends keyof proto.Server.Event>(method: K, ...params: proto.Server.Event[K][]) {
        this.ws.send(JSON.stringify({ method, params }));
    }
}