import { JSDOM } from 'jsdom';
import WebSocket from 'ws';
import { LocalStorage } from "node-localstorage";
import configuration from '../config.json';
import { RainbowSDK } from 'rainbow-web-sdk/lib';

// Create JSDOM and expose globals BEFORE importing rainbow-web-sdk
const DOM = new JSDOM(`<!DOCTYPE html><html><body><p>Placeholder</p></body></html>`, {
    url: 'http://localhost'
});
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

globalThis.config = {}

async function main() {
    // 2) Import the SDK only after the environment is ready
    const { RainbowSDK, LogLevelEnum } = await import('rainbow-web-sdk');

    console.log("init");

    // const sdk = RainbowSDK.getInstance();

    debugger;
    const sdk: RainbowSDK = RainbowSDK.create({
      appConfig: {
        server: configuration.RAINBOW_SERVER || 'demo.openrainbow.org',
        applicationId: configuration.RAINBOW_APP_ID || '',
        secretKey: configuration.RAINBOW_SECRET_KEY || ''
      },
      plugins: [],
      autoLogin: true,
      logLevel: LogLevelEnum.DEBUG
    });

}

console.log("ot");

main().catch((error) => {
    console.error("Error initializing Rainbow SDK:", error);
});