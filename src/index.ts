import { JSDOM } from 'jsdom';

// Create a jsdom instance with a basic HTML document
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: 'http://localhost'
});

// Set up globals required by the SDK
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).DOMParser = dom.window.DOMParser;
(global as any).XMLSerializer = dom.window.XMLSerializer;
(global as any).navigator = dom.window.navigator;

import { LogLevelEnum, RainbowSDK } from 'rainbow-web-sdk';
import config from '../config.json';

class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    constructor() {
        this.test();
    }

    public async test(): Promise<void> {
        console.log("test");
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