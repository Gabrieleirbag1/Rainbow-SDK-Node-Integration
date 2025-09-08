import { JSDOM } from "jsdom";
import WebSocket from "ws";
import { Image as CanvasImage } from "canvas";
import { LocalStorage } from "node-localstorage";
import configuration from "../config.json";
import {
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

// DOM globals
(globalThis as any).window = DOM.window;
document = DOM.window.document;
globalThis.DOMParser = DOM.window.DOMParser;
globalThis.XMLSerializer = DOM.window.XMLSerializer;
globalThis.navigator = DOM.window.navigator;

// Eventtarget
globalThis.Event = DOM.window.Event;
globalThis.EventTarget = DOM.window.EventTarget;

// Localstorage
globalThis.localStorage = new LocalStorage("./scratch");

// Websocket
(globalThis as any).WebSocket = WebSocket;

// Image object
(globalThis as any).Image = CanvasImage;

// Global variables RainbowSDK
globalThis.config = {};
globalThis.version = "Nothing";

class NodeRainbowSDK {
  protected rainbowSDK: RainbowSDK;

  public async main() {
    console.log("init");
    // Import the SDK objects only after the environment is ready
    const { RainbowSDK, LogLevelEnum, ConnectionServiceEvents } = await import(
      "rainbow-web-sdk"
    );

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

    // let userConnected: ConnectedUser = await this.rainbowSDK.start();
    let userConnected = null;
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