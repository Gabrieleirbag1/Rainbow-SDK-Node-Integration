import { JSDOM } from 'jsdom';
import { LogLevelEnum, RainbowSDK } from 'rainbow-web-sdk';
import config from '../config.json';

const DOM = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: 'http://localhost'
});

(global as any).window = DOM.window;
(global as any).document = DOM.window.document;
(global as any).DOMParser = DOM.window.DOMParser;
(global as any).XMLSerializer = DOM.window.XMLSerializer;
(global as any).navigator = DOM.window.navigator;

class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    constructor() {
        this.test();
    }

    public async test(): Promise<void> {
        console.log("test");
        // const div = global.document.createElement('div');
        // div.id = 'jsdom-test';
        // global.document.body.appendChild(div);
        this.rainbowSDK = RainbowSDK.create({
            appConfig: { 
                server: config.RAINBOW_SERVER || 'demo.openrainbow.org', 
                applicationId: config.RAINBOW_APP_ID || '',
                secretKey: config.RAINBOW_SECRET_KEY || ''
            },
            plugins: [],
            autoLogin: true,
            logLevel: LogLevelEnum.WARNING
        });
    }
}

console.log("init");
try {
    const testRainbowSDK = new TestRainbowSDK();
} catch (error) {
    console.error("Error initializing TestRainbowSDK:", error);
}

// index.ts
// import { Strophe } from "strophe.js";

// console.log("Strophe.NS:", Strophe.NS);
