import { JSDOM } from 'jsdom';
import { LogLevelEnum, RainbowSDK } from 'rainbow-web-sdk';
import config from '../config.json';

const DOM = new JSDOM(`<!DOCTYPE html><html><body><p>Placeholder</p></body></html>`, {
    url: 'http://localhost'
});
console.log(DOM.window.document.querySelector("p").textContent);
// expose DOM globals
global.window = DOM.window as any;
global.document = DOM.window.document;
global.DOMParser = DOM.window.DOMParser;
global.XMLSerializer = DOM.window.XMLSerializer.bind(DOM.window);
global.navigator = DOM.window.navigator;

class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    constructor() {
        this.test();
    }

    public async test(): Promise<void> {
        console.log("test");
        const div = global.document.createElement('div');
        div.id = 'jsdom-test';
        global.document.body.appendChild(div);
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