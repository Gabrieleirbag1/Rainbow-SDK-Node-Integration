import { ConnectionServiceEvents, ConnectionState, ConnectedUser, User } from 'rainbow-web-sdk';
import { RBEvent, RainbowSDK, LogLevelEnum } from 'rainbow-web-sdk';
import config from '../config.json';

class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    public async init(): Promise<void> {
        
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

        this.rainbowSDK.connectionService.subscribe(
            (event: RBEvent) => this.connectionStateChangeHandler(event), 
            ConnectionServiceEvents.RAINBOW_ON_CONNECTION_STATE_CHANGE
        );

        let userConnected: ConnectedUser = await this.rainbowSDK.start();
        const user = config.RAINBOW_USER || '';
        const pwd = config.RAINBOW_PASSWORD || '';
        
        if (!userConnected) {
            try { 
                userConnected = await this.rainbowSDK.connectionService.logon(
                    user, 
                    pwd, 
                    true
                ); 
            }
            catch (error: any) { 
                console.error(`[testAppli] ${error.message}`); 
                return; 
            }
        }
        console.info(`[testAppli] connected with user ${userConnected.displayName}`);
    }

    private connectionStateChangeHandler(event: RBEvent): void {
        const connectionState: ConnectionState = event.data;
        console.info(`[testAppli] onConnectionStateChange ${connectionState.state}`);
    }
}
const testRainbowSDK = new TestRainbowSDK();
testRainbowSDK.init().then(() => {
    const sdk: RainbowSDK = RainbowSDK.getInstance();
    const connectedUser: ConnectedUser = sdk.connectedUser;
    console.log(connectedUser);
    const networkUsers: User[] = sdk.userNetwork.getUsers();
    console.log(networkUsers);
});

