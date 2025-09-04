import { LogLevelEnum, RainbowSDK } from 'rainbow-web-sdk';
import config from '../config.json';
class TestRainbowSDK {
    constructor() {
        this.test();
    }
    async test() {
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
        // const sdk: RainbowSDK = RainbowSDK.getInstance();
    }
}
const testRainbowSDK = new TestRainbowSDK();
//# sourceMappingURL=index.js.map