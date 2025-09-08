import { JSDOM } from "jsdom";
import WebSocket from "ws";
import { LocalStorage } from "node-localstorage";
import configuration from "../config.json";
import {
  ConnectedUser,
  ConnectionState,
  RainbowSDK,
  RBEvent,
} from "rainbow-web-sdk/lib";

// Create JSDOM and expose globals BEFORE importing rainbow-web-sdk
const DOM = new JSDOM(
  `<!DOCTYPE html><html><body><p>Placeholder</p></body></html>`,
  {
    url: "http://localhost",
  }
);
// console.log(DOM.window.document.querySelector("p")?.textContent);

// expose DOM globals
window = DOM.window as any;
document = DOM.window.document;
DOMParser = DOM.window.DOMParser;
XMLSerializer = DOM.window.XMLSerializer;
navigator = DOM.window.navigator;

// create localstorage for node
localStorage = new LocalStorage("./scratch");

// extra polyfills used by strophe/webrtc in the web SDK
declare const WebSocket;
Event = DOM.window.Event;
EventTarget = DOM.window.EventTarget;

globalThis.config = {};

class NodeRainbowSDK {
  protected rainbowSDK: RainbowSDK;

  public async main() {
    console.log("init");
    // Import the SDK objects only after the environment is ready
    const { RainbowSDK, LogLevelEnum, ConnectionServiceEvents } = await import(
      "rainbow-web-sdk"
    );

    debugger;
    this.rainbowSDK = RainbowSDK.create({
      appConfig: {
        server: configuration.RAINBOW_SERVER || "demo.openrainbow.org",
        applicationId: configuration.RAINBOW_APP_ID || "",
        secretKey: configuration.RAINBOW_SECRET_KEY || "",
      },
      plugins: [],
      autoLogin: true,
      logLevel: LogLevelEnum.DEBUG,
    });

    this.rainbowSDK.connectionService.subscribe(
      (event: RBEvent) => this.connectionStateChangeHandler(event),
      ConnectionServiceEvents.RAINBOW_ON_CONNECTION_STATE_CHANGE
    );

    let userConnected: ConnectedUser = await this.rainbowSDK.start();
    const user = configuration.RAINBOW_USER || "";
    const pwd = configuration.RAINBOW_PASSWORD || "";

    if (!userConnected) {
      try {
        userConnected = await this.rainbowSDK.connectionService.logon(
          user,
          pwd,
          true
        );
      } catch (error: any) {
        console.error(`[testAppli] ${error.message}`);
        return;
      }
    }
  }

  private connectionStateChangeHandler(event: RBEvent): void {
    const connectionState: ConnectionState = event.data;
    console.info(
      `[testAppli] onConnectionStateChange ${connectionState.state}`
    );
  }

}

const sdk = new NodeRainbowSDK();

sdk.main().catch((error) => {
  console.error("Error initializing Rainbow SDK:", error);
});
