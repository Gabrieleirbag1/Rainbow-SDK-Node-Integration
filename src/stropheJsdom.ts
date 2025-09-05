import { JSDOM } from 'jsdom';
import WebSocket from "ws";

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

// rainbow also needs websocket/eventtarget
(global as any).WebSocket = WebSocket;
(global as any).Event = DOM.window.Event;
(global as any).EventTarget = DOM.window.EventTarget;

// index.ts
import { Strophe } from "strophe.js";

console.log("Strophe.NS:", Strophe.NS);

function runStrophe() {
    const dummyServiceURL = "ws://localhost:5280/xmpp-websocket";
    const connection = new Strophe.Connection(dummyServiceURL);

    console.log("Created Strophe.Connection instance:", connection);

    connection.connect("dummyuser@localhost", "dummypassword", (status) => {
        console.log("Strophe connection status:", status);
    });
}

runStrophe();