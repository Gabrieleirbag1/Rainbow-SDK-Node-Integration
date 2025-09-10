import { JSDOM } from "jsdom";
import WebSocket from "ws";
import { Image as CanvasImage } from "canvas";
import { LocalStorage } from "node-localstorage";
import configuration from "../config.json";
import {
  ConnectionState,
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

// Set up the minimal WebRTC implementation needed for the Rainbow SDK
// This creates dummy objects and methods that satisfy the SDK's requirements
class MediaDevicesPolyfill {
  constructor() {}

  async enumerateDevices() {
    return [
      { deviceId: "default", groupId: "fake", kind: "audioinput", label: "Fake Microphone", toJSON() { return this; } },
      { deviceId: "default", groupId: "fake", kind: "audiooutput", label: "Fake Speaker", toJSON() { return this; } },
      { deviceId: "default", groupId: "fake", kind: "videoinput", label: "Fake Camera", toJSON() { return this; } },
    ];
  }

  async getUserMedia(constraints: any) {
    // Create a silent audio stream
    const stream = new MediaStreamPolyfill();
    
    if (constraints?.audio) {
      const audioTrack = new MediaStreamTrackPolyfill("audio", "default");
      stream.addTrack(audioTrack);
    }
    
    if (constraints?.video) {
      const videoTrack = new MediaStreamTrackPolyfill("video", "default");
      stream.addTrack(videoTrack);
    }
    
    return stream;
  }

  getSupportedConstraints() {
    return {
      width: true,
      height: true,
      deviceId: true,
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: true
    };
  }
}

class MediaStreamTrackPolyfill {
  kind: string;
  id: string;
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: string;
  
  constructor(kind: string, deviceId: string) {
    this.kind = kind;
    this.id = `fake-${kind}-track-${Math.random().toString(36).substring(2, 15)}`;
    this.label = kind === 'audio' ? 'Fake Microphone' : 'Fake Camera';
    this.enabled = true;
    this.muted = false;
    this.readyState = 'live';
  }
  
  stop() {
    this.readyState = 'ended';
  }
  
  getSettings() {
    if (this.kind === 'audio') {
      return {
        deviceId: 'default',
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true
      };
    } else {
      return {
        deviceId: 'default',
        width: 640,
        height: 480,
        frameRate: 30
      };
    }
  }

  getCapabilities() {
    return this.getSettings();
  }

  applyConstraints() {
    return Promise.resolve();
  }

  clone() {
    return new MediaStreamTrackPolyfill(this.kind, 'default');
  }
}

class MediaStreamPolyfill {
  id: string;
  active: boolean;
  private tracks: MediaStreamTrackPolyfill[];
  
  constructor() {
    this.id = `fake-stream-${Math.random().toString(36).substring(2, 15)}`;
    this.active = true;
    this.tracks = [];
  }
  
  addTrack(track: MediaStreamTrackPolyfill) {
    this.tracks.push(track);
    return track;
  }
  
  removeTrack(track: MediaStreamTrackPolyfill) {
    const index = this.tracks.indexOf(track);
    if (index !== -1) {
      this.tracks.splice(index, 1);
    }
  }
  
  getTracks() {
    return [...this.tracks];
  }
  
  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }
  
  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video');
  }
  
  clone() {
    const newStream = new MediaStreamPolyfill();
    this.tracks.forEach(track => {
      newStream.addTrack(track.clone());
    });
    return newStream;
  }
}

class RTCPeerConnectionPolyfill {
  localDescription: any = null;
  remoteDescription: any = null;
  signalingState: string = 'stable';
  iceConnectionState: string = 'new';
  iceGatheringState: string = 'new';
  connectionState: string = 'new';
  
  constructor() {
    setTimeout(() => {
      this.connectionState = 'connected';
      this.iceConnectionState = 'connected';
      if (this.oniceconnectionstatechange) this.oniceconnectionstatechange();
      if (this.onconnectionstatechange) this.onconnectionstatechange();
    }, 500);
  }
  
  createOffer() {
    return Promise.resolve({
      type: 'offer',
      sdp: 'v=0\r\no=- 12345 12345 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\n'
    });
  }
  
  createAnswer() {
    return Promise.resolve({
      type: 'answer',
      sdp: 'v=0\r\no=- 12345 12345 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\n'
    });
  }
  
  setLocalDescription(desc: any) {
    this.localDescription = desc;
    return Promise.resolve();
  }
  
  setRemoteDescription(desc: any) {
    this.remoteDescription = desc;
    return Promise.resolve();
  }
  
  addIceCandidate() {
    return Promise.resolve();
  }
  
  getStats() {
    return Promise.resolve(new Map());
  }
  
  close() {
    this.signalingState = 'closed';
    this.connectionState = 'closed';
    this.iceConnectionState = 'closed';
  }

  addTrack(track: MediaStreamTrackPolyfill, stream: MediaStreamPolyfill) {
    return {
      track,
      streams: [stream]
    };
  }

  onicecandidate: null | ((event: any) => void) = null;
  oniceconnectionstatechange: null | (() => void) = null;
  onicegatheringstatechange: null | (() => void) = null;
  onsignalingstatechange: null | (() => void) = null;
  ontrack: null | ((event: any) => void) = null;
  onconnectionstatechange: null | (() => void) = null;
}

// DOM globals
(globalThis as any).window = DOM.window;
document = DOM.window.document;
globalThis.DOMParser = DOM.window.DOMParser;
globalThis.XMLSerializer = DOM.window.XMLSerializer;
globalThis.navigator = DOM.window.navigator;
globalThis.Event = DOM.window.Event;
globalThis.EventTarget = DOM.window.EventTarget;
(globalThis as any).self = DOM.window;

// Localstorage
globalThis.localStorage = new LocalStorage("./scratch");

// Websocket
(globalThis as any).WebSocket = WebSocket;

// Image object
class ImagePolyfill extends CanvasImage {
  constructor() {
    super(1, 1);
    this.onload = null;
    this.onerror = null;
  }
  
  set src(src: string) {
    if (this.onload) {
      setTimeout(() => {
        if (this.onload) this.onload(new DOM.window.Event('load'));
      }, 0);
    }
  }

  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
}

(globalThis as any).Image = ImagePolyfill;

// WebRTC polyfills
(globalThis.navigator as any).mediaDevices = new MediaDevicesPolyfill();
(globalThis as any).MediaStream = MediaStreamPolyfill;
(globalThis as any).MediaStreamTrack = MediaStreamTrackPolyfill;
(globalThis as any).RTCPeerConnection = RTCPeerConnectionPolyfill;
(globalThis as any).RTCSessionDescription = function(desc: any) { return desc; };
(globalThis as any).RTCIceCandidate = function(candidate: any) { return candidate; };

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
        
        // After successful login, get contacts
        const users: User[] = this.getContacts();
        console.log(`Found ${users.length} contacts`);
        
        if (users.length > 0) {
          await this.sendMessage(users[1], "Hello from Node.js integration");
          
          // Note: calls will be limited without full WebRTC support
          // this.makeAudioCall(users[1]);
        }
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
}

const sdk = new NodeRainbowSDK();

sdk.main().catch((error) => {
  console.error("Error initializing Rainbow SDK:", error);
});