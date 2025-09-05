import { JSDOM } from 'jsdom';
import WebSocket from 'ws';
import config from '../config.json';

// 1) Create JSDOM and expose globals BEFORE importing rainbow-web-sdk
const DOM = new JSDOM(`<!DOCTYPE html><html><body><p>Placeholder</p></body></html>`, {
    url: 'http://localhost'
});
console.log(DOM.window.document.querySelector("p")?.textContent);

// expose DOM globals
global.window = DOM.window as any;
global.document = DOM.window.document;
global.DOMParser = DOM.window.DOMParser;
global.XMLSerializer = DOM.window.XMLSerializer;
global.navigator = DOM.window.navigator;

// extra polyfills used by strophe/webrtc in the web SDK
(global as any).WebSocket = WebSocket;
(global as any).Event = DOM.window.Event;
(global as any).EventTarget = DOM.window.EventTarget;
(global as any).self = global.window;

async function main() {
    // 2) Import the SDK only after the environment is ready
    const { RainbowSDK, LogLevelEnum } = await import('rainbow-web-sdk');

    console.log("init");

    // Example: getInstance (or use RainbowSDK.create({...}) if you prefer)
    const sdk = RainbowSDK.getInstance();

    // Or:
    // const sdk = RainbowSDK.create({
    //   appConfig: {
    //     server: config.RAINBOW_SERVER || 'demo.openrainbow.org',
    //     applicationId: config.RAINBOW_APP_ID || '',
    //     secretKey: config.RAINBOW_SECRET_KEY || ''
    //   },
    //   plugins: [],
    //   autoLogin: true,
    //   logLevel: LogLevelEnum.WARNING
    // });

    // Keep your test code if needed
    const div = global.document.createElement('div');
    div.id = 'jsdom-test';
    global.document.body.appendChild(div);
}

main().catch((error) => {
    console.error("Error initializing Rainbow SDK:", error);
});