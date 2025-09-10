import { JSDOM } from "jsdom";
import WebSocket from "ws";
import { Image as CanvasImage } from "canvas";
import { LocalStorage } from "node-localstorage";
import configuration from "../config.json";
import wrtc from "@roamhq/wrtc"
import {
  CallService,
  ConnectionState,
  MediaType,
  RainbowSDK,
  RBEvent,
  User,
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

// Attach node-webrtc classes to globals expected by web SDK
globalThis.RTCPeerConnection = wrtc.RTCPeerConnection;
globalThis.RTCSessionDescription = wrtc.RTCSessionDescription;
globalThis.RTCIceCandidate = wrtc.RTCIceCandidate;
globalThis.MediaStream = wrtc.MediaStream;
globalThis.MediaStreamTrack = wrtc.MediaStreamTrack;
globalThis.nonstandard = wrtc.nonstandard || {}; // RTCAudioSource/VideoSource
window.RTCPeerConnection = wrtc.RTCPeerConnection;
// window.RTCSessionDescription = wrtc.RTCSessionDescription;
// window.RTCIceCandidate = wrtc.RTCIceCandidate;
// window.MediaStream = wrtc.MediaStream;
// window.MediaStreamTrack = wrtc.MediaStreamTrack;
// Implement navigator.mediaDevices if missing
if (!globalThis.navigator.mediaDevices) {
  (globalThis.navigator as any).mediaDevices = {};
}
(globalThis.navigator.mediaDevices as any).enumerateDevices = async () => {
  return [
    {
      deviceId: "virtual-audio-input",
      kind: "audioinput",
      label: "virtual-audio-input",
      groupId: "virtual-audio",
    },
    {
      deviceId: "virtual-audio-output",
      kind: "audiooutput",
      label: "virtual-audio-output",
      groupId: "virtual-audio",
    },
  ];
};

// Minimal getUserMedia that returns a MediaStream with a synthetic audio track.
// IMPORTANT: this track will not contain actual microphone audio unless you feed it PCM frames.
globalThis.navigator.mediaDevices.getUserMedia = async (constraints = {}) => {
  // If user asked for audio, create an audio track from nonstandard RTCAudioSource.
  if (constraints.audio) {
    if (!wrtc.nonstandard || !wrtc.nonstandard.RTCAudioSource) {
      // If RTCAudioSource isn't available, return an empty MediaStream to avoid breaking SDK.
      return new wrtc.MediaStream();
    }

    // Create source & track
    const audioSource = new wrtc.nonstandard.RTCAudioSource();
    const track = audioSource.createTrack();
    // You should feed frames to audioSource.onData(...) to send real audio
    // See below for an example of feeding silence or PCM frames.
    const stream = new wrtc.MediaStream([track]);

    // Keep a reference so you can push frames later if needed:
    stream.__audioSource = audioSource;
    stream.__audioTrack = track;

    return stream;
  }

  // If only video requested: you can create RTCVideoSource similarly (if supported)
  if (constraints.video) {
    if (wrtc.nonstandard && wrtc.nonstandard.RTCVideoSource) {
      const videoSource = new wrtc.nonstandard.RTCVideoSource();
      const track = videoSource.createTrack();
      return new wrtc.MediaStream([track]);
    }
    return new wrtc.MediaStream();
  }

  return new wrtc.MediaStream();
};


class NodeRainbowSDK {
  protected rainbowSDK: RainbowSDK;
  private medias: MediaType[];
  
  public async main() {
    console.log("init");
    // Import the SDK objects only after the environment is ready
    const { RainbowSDK, LogLevelEnum, ConnectionServiceEvents, CallsPlugin, MediaType } = await import(
      "rainbow-web-sdk"
    );

    this.medias = [MediaType.AUDIO, MediaType.VIDEO];

    this.rainbowSDK = RainbowSDK.create({
      appConfig: {
        server: configuration.RAINBOW_SERVER || "demo.openrainbow.org",
        applicationId: configuration.RAINBOW_APP_ID || "",
        secretKey: configuration.RAINBOW_SECRET_KEY || "",
      },
      plugins: [CallsPlugin],
      autoLogin: true,
      logLevel: LogLevelEnum.ERROR,
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
        this.rainbowSDK.connectionService.logon(user, pwd, true)
          .then((connectedUser) => {
            userConnected = connectedUser;
            const users: User[] = this.getContacts();
            console.log(`Found ${users.length} contacts`);
            this.sendMessage(users[2], "singleton")
            this.makeAudioCall(users[2])
          });
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

  public getContacts(): User[] {
    return this.rainbowSDK.userNetwork.getUsers();
  }

  private getConversationService(): any {
    return this.rainbowSDK.conversationService;
  }

  private getConversation(user: User): Promise<any> {
    const conversationService = this.getConversationService();
    return conversationService.getConversation(user);
  }

  private async sendMessage(user: User, messageText: string): Promise<void> {
    const conversation = await this.getConversation(user);

    if (conversation) {
      conversation.sendMessage(messageText);
    }
  }

  async getCallService(): Promise<CallService> {
    const callService = this.rainbowSDK.callService as CallService;
    console.log(callService)
    return callService;
  }

  makeAudioCall(user: User): void {
    this.getCallService().then(callService => {
      callService.makeWebCall(user);
    });
  }

}

const sdk = new NodeRainbowSDK();

sdk.main().catch((error) => {
  console.error("Error initializing Rainbow SDK:", error);
});