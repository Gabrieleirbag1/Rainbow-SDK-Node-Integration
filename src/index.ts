import {ConnectedUser, LogLevelEnum, RainbowSDK} from 'rainbow-web-sdk';
import config from '../config.json';

class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    constructor() {
        this.test()
    }

    public async test(): Promise<void> {
        console.log("test")
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
