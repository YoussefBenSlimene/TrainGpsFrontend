import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  StompHeaders
} from "./chunk-UY5L5JQL.js";
import {
  Injectable,
  Optional
} from "./chunk-3I6MABS4.js";
import {
  require_operators
} from "./chunk-XCIYP5SE.js";
import {
  require_cjs
} from "./chunk-ZUJ64LXG.js";
import "./chunk-OYTRG5F6.js";
import {
  __commonJS,
  __toESM
} from "./chunk-YHCV7DAQ.js";

// node_modules/angular2-uuid/index.js
var require_angular2_uuid = __commonJS({
  "node_modules/angular2-uuid/index.js"(exports) {
    "use strict";
    var UUID2 = function() {
      function UUID3() {
      }
      UUID3.UUID = function() {
        if (typeof window !== "undefined" && typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues !== "undefined") {
          var buf = new Uint16Array(8);
          window.crypto.getRandomValues(buf);
          return this.pad4(buf[0]) + this.pad4(buf[1]) + "-" + this.pad4(buf[2]) + "-" + this.pad4(buf[3]) + "-" + this.pad4(buf[4]) + "-" + this.pad4(buf[5]) + this.pad4(buf[6]) + this.pad4(buf[7]);
        } else {
          return this.random4() + this.random4() + "-" + this.random4() + "-" + this.random4() + "-" + this.random4() + "-" + this.random4() + this.random4() + this.random4();
        }
      };
      UUID3.pad4 = function(num) {
        var ret = num.toString(16);
        while (ret.length < 4) {
          ret = "0" + ret;
        }
        return ret;
      };
      UUID3.random4 = function() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
      };
      return UUID3;
    }();
    exports.UUID = UUID2;
  }
});

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-config.js
var RxStompConfig = class {
};

// node_modules/@stomp/rx-stomp/esm6/rx-stomp.js
var import_rxjs = __toESM(require_cjs());
var import_operators = __toESM(require_operators());

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/byte.js
var BYTE = {
  // LINEFEED byte (octet 10)
  LF: "\n",
  // NULL byte (octet 0)
  NULL: "\0"
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/frame-impl.js
var FrameImpl = class _FrameImpl {
  /**
   * Frame constructor. `command`, `headers` and `body` are available as properties.
   *
   * @internal
   */
  constructor(params) {
    const {
      command,
      headers,
      body,
      binaryBody,
      escapeHeaderValues,
      skipContentLengthHeader
    } = params;
    this.command = command;
    this.headers = Object.assign({}, headers || {});
    if (binaryBody) {
      this._binaryBody = binaryBody;
      this.isBinaryBody = true;
    } else {
      this._body = body || "";
      this.isBinaryBody = false;
    }
    this.escapeHeaderValues = escapeHeaderValues || false;
    this.skipContentLengthHeader = skipContentLengthHeader || false;
  }
  /**
   * body of the frame
   */
  get body() {
    if (!this._body && this.isBinaryBody) {
      this._body = new TextDecoder().decode(this._binaryBody);
    }
    return this._body;
  }
  /**
   * body as Uint8Array
   */
  get binaryBody() {
    if (!this._binaryBody && !this.isBinaryBody) {
      this._binaryBody = new TextEncoder().encode(this._body);
    }
    return this._binaryBody;
  }
  /**
   * deserialize a STOMP Frame from raw data.
   *
   * @internal
   */
  static fromRawFrame(rawFrame, escapeHeaderValues) {
    const headers = {};
    const trim = (str) => str.replace(/^\s+|\s+$/g, "");
    for (const header of rawFrame.headers.reverse()) {
      const idx = header.indexOf(":");
      const key = trim(header[0]);
      let value = trim(header[1]);
      if (escapeHeaderValues && rawFrame.command !== "CONNECT" && rawFrame.command !== "CONNECTED") {
        value = _FrameImpl.hdrValueUnEscape(value);
      }
      headers[key] = value;
    }
    return new _FrameImpl({
      command: rawFrame.command,
      headers,
      binaryBody: rawFrame.binaryBody,
      escapeHeaderValues
    });
  }
  /**
   * @internal
   */
  toString() {
    return this.serializeCmdAndHeaders();
  }
  /**
   * serialize this Frame in a format suitable to be passed to WebSocket.
   * If the body is string the output will be string.
   * If the body is binary (i.e. of type Unit8Array) it will be serialized to ArrayBuffer.
   *
   * @internal
   */
  serialize() {
    const cmdAndHeaders = this.serializeCmdAndHeaders();
    if (this.isBinaryBody) {
      return _FrameImpl.toUnit8Array(cmdAndHeaders, this._binaryBody).buffer;
    } else {
      return cmdAndHeaders + this._body + BYTE.NULL;
    }
  }
  serializeCmdAndHeaders() {
    const lines = [this.command];
    if (this.skipContentLengthHeader) {
      delete this.headers["content-length"];
    }
    for (const name of Object.keys(this.headers || {})) {
      const value = this.headers[name];
      if (this.escapeHeaderValues && this.command !== "CONNECT" && this.command !== "CONNECTED") {
        lines.push(`${name}:${_FrameImpl.hdrValueEscape(`${value}`)}`);
      } else {
        lines.push(`${name}:${value}`);
      }
    }
    if (this.isBinaryBody || !this.isBodyEmpty() && !this.skipContentLengthHeader) {
      lines.push(`content-length:${this.bodyLength()}`);
    }
    return lines.join(BYTE.LF) + BYTE.LF + BYTE.LF;
  }
  isBodyEmpty() {
    return this.bodyLength() === 0;
  }
  bodyLength() {
    const binaryBody = this.binaryBody;
    return binaryBody ? binaryBody.length : 0;
  }
  /**
   * Compute the size of a UTF-8 string by counting its number of bytes
   * (and not the number of characters composing the string)
   */
  static sizeOfUTF8(s) {
    return s ? new TextEncoder().encode(s).length : 0;
  }
  static toUnit8Array(cmdAndHeaders, binaryBody) {
    const uint8CmdAndHeaders = new TextEncoder().encode(cmdAndHeaders);
    const nullTerminator = new Uint8Array([0]);
    const uint8Frame = new Uint8Array(uint8CmdAndHeaders.length + binaryBody.length + nullTerminator.length);
    uint8Frame.set(uint8CmdAndHeaders);
    uint8Frame.set(binaryBody, uint8CmdAndHeaders.length);
    uint8Frame.set(nullTerminator, uint8CmdAndHeaders.length + binaryBody.length);
    return uint8Frame;
  }
  /**
   * Serialize a STOMP frame as per STOMP standards, suitable to be sent to the STOMP broker.
   *
   * @internal
   */
  static marshall(params) {
    const frame = new _FrameImpl(params);
    return frame.serialize();
  }
  /**
   *  Escape header values
   */
  static hdrValueEscape(str) {
    return str.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c");
  }
  /**
   * UnEscape header values
   */
  static hdrValueUnEscape(str) {
    return str.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\");
  }
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/parser.js
var NULL = 0;
var LF = 10;
var CR = 13;
var COLON = 58;
var Parser = class {
  constructor(onFrame, onIncomingPing) {
    this.onFrame = onFrame;
    this.onIncomingPing = onIncomingPing;
    this._encoder = new TextEncoder();
    this._decoder = new TextDecoder();
    this._token = [];
    this._initState();
  }
  parseChunk(segment, appendMissingNULLonIncoming = false) {
    let chunk;
    if (segment instanceof ArrayBuffer) {
      chunk = new Uint8Array(segment);
    } else {
      chunk = this._encoder.encode(segment);
    }
    if (appendMissingNULLonIncoming && chunk[chunk.length - 1] !== 0) {
      const chunkWithNull = new Uint8Array(chunk.length + 1);
      chunkWithNull.set(chunk, 0);
      chunkWithNull[chunk.length] = 0;
      chunk = chunkWithNull;
    }
    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];
      this._onByte(byte);
    }
  }
  // The following implements a simple Rec Descent Parser.
  // The grammar is simple and just one byte tells what should be the next state
  _collectFrame(byte) {
    if (byte === NULL) {
      return;
    }
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this.onIncomingPing();
      return;
    }
    this._onByte = this._collectCommand;
    this._reinjectByte(byte);
  }
  _collectCommand(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._results.command = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte);
  }
  _collectHeaders(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._setupCollectBody();
      return;
    }
    this._onByte = this._collectHeaderKey;
    this._reinjectByte(byte);
  }
  _reinjectByte(byte) {
    this._onByte(byte);
  }
  _collectHeaderKey(byte) {
    if (byte === COLON) {
      this._headerKey = this._consumeTokenAsUTF8();
      this._onByte = this._collectHeaderValue;
      return;
    }
    this._consumeByte(byte);
  }
  _collectHeaderValue(byte) {
    if (byte === CR) {
      return;
    }
    if (byte === LF) {
      this._results.headers.push([this._headerKey, this._consumeTokenAsUTF8()]);
      this._headerKey = void 0;
      this._onByte = this._collectHeaders;
      return;
    }
    this._consumeByte(byte);
  }
  _setupCollectBody() {
    const contentLengthHeader = this._results.headers.filter((header) => {
      return header[0] === "content-length";
    })[0];
    if (contentLengthHeader) {
      this._bodyBytesRemaining = parseInt(contentLengthHeader[1], 10);
      this._onByte = this._collectBodyFixedSize;
    } else {
      this._onByte = this._collectBodyNullTerminated;
    }
  }
  _collectBodyNullTerminated(byte) {
    if (byte === NULL) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte);
  }
  _collectBodyFixedSize(byte) {
    if (this._bodyBytesRemaining-- === 0) {
      this._retrievedBody();
      return;
    }
    this._consumeByte(byte);
  }
  _retrievedBody() {
    this._results.binaryBody = this._consumeTokenAsRaw();
    this.onFrame(this._results);
    this._initState();
  }
  // Rec Descent Parser helpers
  _consumeByte(byte) {
    this._token.push(byte);
  }
  _consumeTokenAsUTF8() {
    return this._decoder.decode(this._consumeTokenAsRaw());
  }
  _consumeTokenAsRaw() {
    const rawResult = new Uint8Array(this._token);
    this._token = [];
    return rawResult;
  }
  _initState() {
    this._results = {
      command: void 0,
      headers: [],
      binaryBody: void 0
    };
    this._token = [];
    this._headerKey = void 0;
    this._onByte = this._collectFrame;
  }
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/types.js
var StompSocketState;
(function(StompSocketState2) {
  StompSocketState2[StompSocketState2["CONNECTING"] = 0] = "CONNECTING";
  StompSocketState2[StompSocketState2["OPEN"] = 1] = "OPEN";
  StompSocketState2[StompSocketState2["CLOSING"] = 2] = "CLOSING";
  StompSocketState2[StompSocketState2["CLOSED"] = 3] = "CLOSED";
})(StompSocketState || (StompSocketState = {}));
var ActivationState;
(function(ActivationState2) {
  ActivationState2[ActivationState2["ACTIVE"] = 0] = "ACTIVE";
  ActivationState2[ActivationState2["DEACTIVATING"] = 1] = "DEACTIVATING";
  ActivationState2[ActivationState2["INACTIVE"] = 2] = "INACTIVE";
})(ActivationState || (ActivationState = {}));

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/versions.js
var Versions = class {
  /**
   * Takes an array of string of versions, typical elements '1.0', '1.1', or '1.2'
   *
   * You will an instance if this class if you want to override supported versions to be declared during
   * STOMP handshake.
   */
  constructor(versions) {
    this.versions = versions;
  }
  /**
   * Used as part of CONNECT STOMP Frame
   */
  supportedVersions() {
    return this.versions.join(",");
  }
  /**
   * Used while creating a WebSocket
   */
  protocolVersions() {
    return this.versions.map((x) => `v${x.replace(".", "")}.stomp`);
  }
};
Versions.V1_0 = "1.0";
Versions.V1_1 = "1.1";
Versions.V1_2 = "1.2";
Versions.default = new Versions([Versions.V1_0, Versions.V1_1, Versions.V1_2]);

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/augment-websocket.js
function augmentWebsocket(webSocket, debug) {
  webSocket.terminate = function() {
    const noOp = () => {
    };
    this.onerror = noOp;
    this.onmessage = noOp;
    this.onopen = noOp;
    const ts = /* @__PURE__ */ new Date();
    const origOnClose = this.onclose;
    this.onclose = (closeEvent) => {
      const delay = (/* @__PURE__ */ new Date()).getTime() - ts.getTime();
      debug(`Discarded socket closed after ${delay}ms, with code/reason: ${closeEvent.code}/${closeEvent.reason}`);
    };
    this.close();
    origOnClose.call(this, {
      code: 4001,
      reason: "Heartbeat failure, discarding the socket",
      wasClean: false
    });
  };
}

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/stomp-handler.js
var StompHandler = class {
  constructor(_client, _webSocket, config = {}) {
    this._client = _client;
    this._webSocket = _webSocket;
    this._serverFrameHandlers = {
      // [CONNECTED Frame](http://stomp.github.com/stomp-specification-1.2.html#CONNECTED_Frame)
      CONNECTED: (frame) => {
        this.debug(`connected to server ${frame.headers.server}`);
        this._connected = true;
        this._connectedVersion = frame.headers.version;
        if (this._connectedVersion === Versions.V1_2) {
          this._escapeHeaderValues = true;
        }
        this._setupHeartbeat(frame.headers);
        this.onConnect(frame);
      },
      // [MESSAGE Frame](http://stomp.github.com/stomp-specification-1.2.html#MESSAGE)
      MESSAGE: (frame) => {
        const subscription = frame.headers.subscription;
        const onReceive = this._subscriptions[subscription] || this.onUnhandledMessage;
        const message = frame;
        const client = this;
        const messageId = this._connectedVersion === Versions.V1_2 ? message.headers.ack : message.headers["message-id"];
        message.ack = (headers = {}) => {
          return client.ack(messageId, subscription, headers);
        };
        message.nack = (headers = {}) => {
          return client.nack(messageId, subscription, headers);
        };
        onReceive(message);
      },
      // [RECEIPT Frame](http://stomp.github.com/stomp-specification-1.2.html#RECEIPT)
      RECEIPT: (frame) => {
        const callback = this._receiptWatchers[frame.headers["receipt-id"]];
        if (callback) {
          callback(frame);
          delete this._receiptWatchers[frame.headers["receipt-id"]];
        } else {
          this.onUnhandledReceipt(frame);
        }
      },
      // [ERROR Frame](http://stomp.github.com/stomp-specification-1.2.html#ERROR)
      ERROR: (frame) => {
        this.onStompError(frame);
      }
    };
    this._counter = 0;
    this._subscriptions = {};
    this._receiptWatchers = {};
    this._partialData = "";
    this._escapeHeaderValues = false;
    this._lastServerActivityTS = Date.now();
    this.configure(config);
  }
  get connectedVersion() {
    return this._connectedVersion;
  }
  get connected() {
    return this._connected;
  }
  configure(conf) {
    Object.assign(this, conf);
  }
  start() {
    const parser = new Parser(
      // On Frame
      (rawFrame) => {
        const frame = FrameImpl.fromRawFrame(rawFrame, this._escapeHeaderValues);
        if (!this.logRawCommunication) {
          this.debug(`<<< ${frame}`);
        }
        const serverFrameHandler = this._serverFrameHandlers[frame.command] || this.onUnhandledFrame;
        serverFrameHandler(frame);
      },
      // On Incoming Ping
      () => {
        this.debug("<<< PONG");
      }
    );
    this._webSocket.onmessage = (evt) => {
      this.debug("Received data");
      this._lastServerActivityTS = Date.now();
      if (this.logRawCommunication) {
        const rawChunkAsString = evt.data instanceof ArrayBuffer ? new TextDecoder().decode(evt.data) : evt.data;
        this.debug(`<<< ${rawChunkAsString}`);
      }
      parser.parseChunk(evt.data, this.appendMissingNULLonIncoming);
    };
    this._onclose = (closeEvent) => {
      this.debug(`Connection closed to ${this._client.brokerURL}`);
      this._cleanUp();
      this.onWebSocketClose(closeEvent);
    };
    this._webSocket.onclose = this._onclose;
    this._webSocket.onerror = (errorEvent) => {
      this.onWebSocketError(errorEvent);
    };
    this._webSocket.onopen = () => {
      const connectHeaders = Object.assign({}, this.connectHeaders);
      this.debug("Web Socket Opened...");
      connectHeaders["accept-version"] = this.stompVersions.supportedVersions();
      connectHeaders["heart-beat"] = [this.heartbeatOutgoing, this.heartbeatIncoming].join(",");
      this._transmit({
        command: "CONNECT",
        headers: connectHeaders
      });
    };
  }
  _setupHeartbeat(headers) {
    if (headers.version !== Versions.V1_1 && headers.version !== Versions.V1_2) {
      return;
    }
    if (!headers["heart-beat"]) {
      return;
    }
    const [serverOutgoing, serverIncoming] = headers["heart-beat"].split(",").map((v) => parseInt(v, 10));
    if (this.heartbeatOutgoing !== 0 && serverIncoming !== 0) {
      const ttl = Math.max(this.heartbeatOutgoing, serverIncoming);
      this.debug(`send PING every ${ttl}ms`);
      this._pinger = setInterval(() => {
        if (this._webSocket.readyState === StompSocketState.OPEN) {
          this._webSocket.send(BYTE.LF);
          this.debug(">>> PING");
        }
      }, ttl);
    }
    if (this.heartbeatIncoming !== 0 && serverOutgoing !== 0) {
      const ttl = Math.max(this.heartbeatIncoming, serverOutgoing);
      this.debug(`check PONG every ${ttl}ms`);
      this._ponger = setInterval(() => {
        const delta = Date.now() - this._lastServerActivityTS;
        if (delta > ttl * 2) {
          this.debug(`did not receive server activity for the last ${delta}ms`);
          this._closeOrDiscardWebsocket();
        }
      }, ttl);
    }
  }
  _closeOrDiscardWebsocket() {
    if (this.discardWebsocketOnCommFailure) {
      this.debug("Discarding websocket, the underlying socket may linger for a while");
      this._discardWebsocket();
    } else {
      this.debug("Issuing close on the websocket");
      this._closeWebsocket();
    }
  }
  forceDisconnect() {
    if (this._webSocket) {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeOrDiscardWebsocket();
      }
    }
  }
  _closeWebsocket() {
    this._webSocket.onmessage = () => {
    };
    this._webSocket.close();
  }
  _discardWebsocket() {
    if (!this._webSocket.terminate) {
      augmentWebsocket(this._webSocket, (msg) => this.debug(msg));
    }
    this._webSocket.terminate();
  }
  _transmit(params) {
    const {
      command,
      headers,
      body,
      binaryBody,
      skipContentLengthHeader
    } = params;
    const frame = new FrameImpl({
      command,
      headers,
      body,
      binaryBody,
      escapeHeaderValues: this._escapeHeaderValues,
      skipContentLengthHeader
    });
    let rawChunk = frame.serialize();
    if (this.logRawCommunication) {
      this.debug(`>>> ${rawChunk}`);
    } else {
      this.debug(`>>> ${frame}`);
    }
    if (this.forceBinaryWSFrames && typeof rawChunk === "string") {
      rawChunk = new TextEncoder().encode(rawChunk);
    }
    if (typeof rawChunk !== "string" || !this.splitLargeFrames) {
      this._webSocket.send(rawChunk);
    } else {
      let out = rawChunk;
      while (out.length > 0) {
        const chunk = out.substring(0, this.maxWebSocketChunkSize);
        out = out.substring(this.maxWebSocketChunkSize);
        this._webSocket.send(chunk);
        this.debug(`chunk sent = ${chunk.length}, remaining = ${out.length}`);
      }
    }
  }
  dispose() {
    if (this.connected) {
      try {
        const disconnectHeaders = Object.assign({}, this.disconnectHeaders);
        if (!disconnectHeaders.receipt) {
          disconnectHeaders.receipt = `close-${this._counter++}`;
        }
        this.watchForReceipt(disconnectHeaders.receipt, (frame) => {
          this._closeWebsocket();
          this._cleanUp();
          this.onDisconnect(frame);
        });
        this._transmit({
          command: "DISCONNECT",
          headers: disconnectHeaders
        });
      } catch (error) {
        this.debug(`Ignoring error during disconnect ${error}`);
      }
    } else {
      if (this._webSocket.readyState === StompSocketState.CONNECTING || this._webSocket.readyState === StompSocketState.OPEN) {
        this._closeWebsocket();
      }
    }
  }
  _cleanUp() {
    this._connected = false;
    if (this._pinger) {
      clearInterval(this._pinger);
    }
    if (this._ponger) {
      clearInterval(this._ponger);
    }
  }
  publish(params) {
    const {
      destination,
      headers,
      body,
      binaryBody,
      skipContentLengthHeader
    } = params;
    const hdrs = Object.assign({
      destination
    }, headers);
    this._transmit({
      command: "SEND",
      headers: hdrs,
      body,
      binaryBody,
      skipContentLengthHeader
    });
  }
  watchForReceipt(receiptId, callback) {
    this._receiptWatchers[receiptId] = callback;
  }
  subscribe(destination, callback, headers = {}) {
    headers = Object.assign({}, headers);
    if (!headers.id) {
      headers.id = `sub-${this._counter++}`;
    }
    headers.destination = destination;
    this._subscriptions[headers.id] = callback;
    this._transmit({
      command: "SUBSCRIBE",
      headers
    });
    const client = this;
    return {
      id: headers.id,
      unsubscribe(hdrs) {
        return client.unsubscribe(headers.id, hdrs);
      }
    };
  }
  unsubscribe(id, headers = {}) {
    headers = Object.assign({}, headers);
    delete this._subscriptions[id];
    headers.id = id;
    this._transmit({
      command: "UNSUBSCRIBE",
      headers
    });
  }
  begin(transactionId) {
    const txId = transactionId || `tx-${this._counter++}`;
    this._transmit({
      command: "BEGIN",
      headers: {
        transaction: txId
      }
    });
    const client = this;
    return {
      id: txId,
      commit() {
        client.commit(txId);
      },
      abort() {
        client.abort(txId);
      }
    };
  }
  commit(transactionId) {
    this._transmit({
      command: "COMMIT",
      headers: {
        transaction: transactionId
      }
    });
  }
  abort(transactionId) {
    this._transmit({
      command: "ABORT",
      headers: {
        transaction: transactionId
      }
    });
  }
  ack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    this._transmit({
      command: "ACK",
      headers
    });
  }
  nack(messageId, subscriptionId, headers = {}) {
    headers = Object.assign({}, headers);
    if (this._connectedVersion === Versions.V1_2) {
      headers.id = messageId;
    } else {
      headers["message-id"] = messageId;
    }
    headers.subscription = subscriptionId;
    return this._transmit({
      command: "NACK",
      headers
    });
  }
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/client.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var Client = class {
  /**
   * Create an instance.
   */
  constructor(conf = {}) {
    this.stompVersions = Versions.default;
    this.connectionTimeout = 0;
    this.reconnectDelay = 5e3;
    this.heartbeatIncoming = 1e4;
    this.heartbeatOutgoing = 1e4;
    this.splitLargeFrames = false;
    this.maxWebSocketChunkSize = 8 * 1024;
    this.forceBinaryWSFrames = false;
    this.appendMissingNULLonIncoming = false;
    this.state = ActivationState.INACTIVE;
    const noOp = () => {
    };
    this.debug = noOp;
    this.beforeConnect = noOp;
    this.onConnect = noOp;
    this.onDisconnect = noOp;
    this.onUnhandledMessage = noOp;
    this.onUnhandledReceipt = noOp;
    this.onUnhandledFrame = noOp;
    this.onStompError = noOp;
    this.onWebSocketClose = noOp;
    this.onWebSocketError = noOp;
    this.logRawCommunication = false;
    this.onChangeState = noOp;
    this.connectHeaders = {};
    this._disconnectHeaders = {};
    this.configure(conf);
  }
  /**
   * Underlying WebSocket instance, READONLY.
   */
  get webSocket() {
    return this._stompHandler ? this._stompHandler._webSocket : void 0;
  }
  /**
   * Disconnection headers.
   */
  get disconnectHeaders() {
    return this._disconnectHeaders;
  }
  set disconnectHeaders(value) {
    this._disconnectHeaders = value;
    if (this._stompHandler) {
      this._stompHandler.disconnectHeaders = this._disconnectHeaders;
    }
  }
  /**
   * `true` if there is a active connection with STOMP Broker
   */
  get connected() {
    return !!this._stompHandler && this._stompHandler.connected;
  }
  /**
   * version of STOMP protocol negotiated with the server, READONLY
   */
  get connectedVersion() {
    return this._stompHandler ? this._stompHandler.connectedVersion : void 0;
  }
  /**
   * if the client is active (connected or going to reconnect)
   */
  get active() {
    return this.state === ActivationState.ACTIVE;
  }
  _changeState(state) {
    this.state = state;
    this.onChangeState(state);
  }
  /**
   * Update configuration.
   */
  configure(conf) {
    Object.assign(this, conf);
  }
  /**
   * Initiate the connection with the broker.
   * If the connection breaks, as per [Client#reconnectDelay]{@link Client#reconnectDelay},
   * it will keep trying to reconnect.
   *
   * Call [Client#deactivate]{@link Client#deactivate} to disconnect and stop reconnection attempts.
   */
  activate() {
    if (this.state === ActivationState.DEACTIVATING) {
      this.debug("Still DEACTIVATING, please await call to deactivate before trying to re-activate");
      throw new Error("Still DEACTIVATING, can not activate now");
    }
    if (this.active) {
      this.debug("Already ACTIVE, ignoring request to activate");
      return;
    }
    this._changeState(ActivationState.ACTIVE);
    this._connect();
  }
  _connect() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.connected) {
        this.debug("STOMP: already connected, nothing to do");
        return;
      }
      yield this.beforeConnect();
      if (!this.active) {
        this.debug("Client has been marked inactive, will not attempt to connect");
        return;
      }
      if (this.connectionTimeout > 0) {
        if (this._connectionWatcher) {
          clearTimeout(this._connectionWatcher);
        }
        this._connectionWatcher = setTimeout(() => {
          if (this.connected) {
            return;
          }
          this.debug(`Connection not established in ${this.connectionTimeout}ms, closing socket`);
          this.forceDisconnect();
        }, this.connectionTimeout);
      }
      this.debug("Opening Web Socket...");
      const webSocket = this._createWebSocket();
      this._stompHandler = new StompHandler(this, webSocket, {
        debug: this.debug,
        stompVersions: this.stompVersions,
        connectHeaders: this.connectHeaders,
        disconnectHeaders: this._disconnectHeaders,
        heartbeatIncoming: this.heartbeatIncoming,
        heartbeatOutgoing: this.heartbeatOutgoing,
        splitLargeFrames: this.splitLargeFrames,
        maxWebSocketChunkSize: this.maxWebSocketChunkSize,
        forceBinaryWSFrames: this.forceBinaryWSFrames,
        logRawCommunication: this.logRawCommunication,
        appendMissingNULLonIncoming: this.appendMissingNULLonIncoming,
        discardWebsocketOnCommFailure: this.discardWebsocketOnCommFailure,
        onConnect: (frame) => {
          if (this._connectionWatcher) {
            clearTimeout(this._connectionWatcher);
            this._connectionWatcher = void 0;
          }
          if (!this.active) {
            this.debug("STOMP got connected while deactivate was issued, will disconnect now");
            this._disposeStompHandler();
            return;
          }
          this.onConnect(frame);
        },
        onDisconnect: (frame) => {
          this.onDisconnect(frame);
        },
        onStompError: (frame) => {
          this.onStompError(frame);
        },
        onWebSocketClose: (evt) => {
          this._stompHandler = void 0;
          if (this.state === ActivationState.DEACTIVATING) {
            this._resolveSocketClose();
            this._resolveSocketClose = void 0;
            this._changeState(ActivationState.INACTIVE);
          }
          this.onWebSocketClose(evt);
          if (this.active) {
            this._schedule_reconnect();
          }
        },
        onWebSocketError: (evt) => {
          this.onWebSocketError(evt);
        },
        onUnhandledMessage: (message) => {
          this.onUnhandledMessage(message);
        },
        onUnhandledReceipt: (frame) => {
          this.onUnhandledReceipt(frame);
        },
        onUnhandledFrame: (frame) => {
          this.onUnhandledFrame(frame);
        }
      });
      this._stompHandler.start();
    });
  }
  _createWebSocket() {
    let webSocket;
    if (this.webSocketFactory) {
      webSocket = this.webSocketFactory();
    } else {
      webSocket = new WebSocket(this.brokerURL, this.stompVersions.protocolVersions());
    }
    webSocket.binaryType = "arraybuffer";
    return webSocket;
  }
  _schedule_reconnect() {
    if (this.reconnectDelay > 0) {
      this.debug(`STOMP: scheduling reconnection in ${this.reconnectDelay}ms`);
      this._reconnector = setTimeout(() => {
        this._connect();
      }, this.reconnectDelay);
    }
  }
  /**
   * Disconnect if connected and stop auto reconnect loop.
   * Appropriate callbacks will be invoked if underlying STOMP connection was connected.
   *
   * This call is async, it will resolve immediately if there is no underlying active websocket,
   * otherwise, it will resolve after underlying websocket is properly disposed.
   *
   * To reactivate you can call [Client#activate]{@link Client#activate}.
   */
  deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
      let retPromise;
      if (this.state !== ActivationState.ACTIVE) {
        this.debug(`Already ${ActivationState[this.state]}, ignoring call to deactivate`);
        return Promise.resolve();
      }
      this._changeState(ActivationState.DEACTIVATING);
      if (this._reconnector) {
        clearTimeout(this._reconnector);
      }
      if (this._stompHandler && this.webSocket.readyState !== StompSocketState.CLOSED) {
        retPromise = new Promise((resolve, reject) => {
          this._resolveSocketClose = resolve;
        });
      } else {
        this._changeState(ActivationState.INACTIVE);
        return Promise.resolve();
      }
      this._disposeStompHandler();
      return retPromise;
    });
  }
  /**
   * Force disconnect if there is an active connection by directly closing the underlying WebSocket.
   * This is different than a normal disconnect where a DISCONNECT sequence is carried out with the broker.
   * After forcing disconnect, automatic reconnect will be attempted.
   * To stop further reconnects call [Client#deactivate]{@link Client#deactivate} as well.
   */
  forceDisconnect() {
    if (this._stompHandler) {
      this._stompHandler.forceDisconnect();
    }
  }
  _disposeStompHandler() {
    if (this._stompHandler) {
      this._stompHandler.dispose();
      this._stompHandler = null;
    }
  }
  /**
   * Send a message to a named destination. Refer to your STOMP broker documentation for types
   * and naming of destinations.
   *
   * STOMP protocol specifies and suggests some headers and also allows broker specific headers.
   *
   * `body` must be String.
   * You will need to covert the payload to string in case it is not string (e.g. JSON).
   *
   * To send a binary message body use binaryBody parameter. It should be a
   * [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).
   * Sometimes brokers may not support binary frames out of the box.
   * Please check your broker documentation.
   *
   * `content-length` header is automatically added to the STOMP Frame sent to the broker.
   * Set `skipContentLengthHeader` to indicate that `content-length` header should not be added.
   * For binary messages `content-length` header is always added.
   *
   * Caution: The broker will, most likely, report an error and disconnect if message body has NULL octet(s)
   * and `content-length` header is missing.
   *
   * ```javascript
   *        client.publish({destination: "/queue/test", headers: {priority: 9}, body: "Hello, STOMP"});
   *
   *        // Only destination is mandatory parameter
   *        client.publish({destination: "/queue/test", body: "Hello, STOMP"});
   *
   *        // Skip content-length header in the frame to the broker
   *        client.publish({"/queue/test", body: "Hello, STOMP", skipContentLengthHeader: true});
   *
   *        var binaryData = generateBinaryData(); // This need to be of type Uint8Array
   *        // setting content-type header is not mandatory, however a good practice
   *        client.publish({destination: '/topic/special', binaryBody: binaryData,
   *                         headers: {'content-type': 'application/octet-stream'}});
   * ```
   */
  publish(params) {
    this._stompHandler.publish(params);
  }
  /**
   * STOMP brokers may carry out operation asynchronously and allow requesting for acknowledgement.
   * To request an acknowledgement, a `receipt` header needs to be sent with the actual request.
   * The value (say receipt-id) for this header needs to be unique for each use. Typically a sequence, a UUID, a
   * random number or a combination may be used.
   *
   * A complaint broker will send a RECEIPT frame when an operation has actually been completed.
   * The operation needs to be matched based in the value of the receipt-id.
   *
   * This method allow watching for a receipt and invoke the callback
   * when corresponding receipt has been received.
   *
   * The actual {@link FrameImpl} will be passed as parameter to the callback.
   *
   * Example:
   * ```javascript
   *        // Subscribing with acknowledgement
   *        let receiptId = randomText();
   *
   *        client.watchForReceipt(receiptId, function() {
   *          // Will be called after server acknowledges
   *        });
   *
   *        client.subscribe(TEST.destination, onMessage, {receipt: receiptId});
   *
   *
   *        // Publishing with acknowledgement
   *        receiptId = randomText();
   *
   *        client.watchForReceipt(receiptId, function() {
   *          // Will be called after server acknowledges
   *        });
   *        client.publish({destination: TEST.destination, headers: {receipt: receiptId}, body: msg});
   * ```
   */
  watchForReceipt(receiptId, callback) {
    this._stompHandler.watchForReceipt(receiptId, callback);
  }
  /**
   * Subscribe to a STOMP Broker location. The callback will be invoked for each received message with
   * the {@link IMessage} as argument.
   *
   * Note: The library will generate an unique ID if there is none provided in the headers.
   *       To use your own ID, pass it using the headers argument.
   *
   * ```javascript
   *        callback = function(message) {
   *        // called when the client receives a STOMP message from the server
   *          if (message.body) {
   *            alert("got message with body " + message.body)
   *          } else {
   *            alert("got empty message");
   *          }
   *        });
   *
   *        var subscription = client.subscribe("/queue/test", callback);
   *
   *        // Explicit subscription id
   *        var mySubId = 'my-subscription-id-001';
   *        var subscription = client.subscribe(destination, callback, { id: mySubId });
   * ```
   */
  subscribe(destination, callback, headers = {}) {
    return this._stompHandler.subscribe(destination, callback, headers);
  }
  /**
   * It is preferable to unsubscribe from a subscription by calling
   * `unsubscribe()` directly on {@link StompSubscription} returned by `client.subscribe()`:
   *
   * ```javascript
   *        var subscription = client.subscribe(destination, onmessage);
   *        // ...
   *        subscription.unsubscribe();
   * ```
   *
   * See: http://stomp.github.com/stomp-specification-1.2.html#UNSUBSCRIBE UNSUBSCRIBE Frame
   */
  unsubscribe(id, headers = {}) {
    this._stompHandler.unsubscribe(id, headers);
  }
  /**
   * Start a transaction, the returned {@link ITransaction} has methods - [commit]{@link ITransaction#commit}
   * and [abort]{@link ITransaction#abort}.
   *
   * `transactionId` is optional, if not passed the library will generate it internally.
   */
  begin(transactionId) {
    return this._stompHandler.begin(transactionId);
  }
  /**
   * Commit a transaction.
   *
   * It is preferable to commit a transaction by calling [commit]{@link ITransaction#commit} directly on
   * {@link ITransaction} returned by [client.begin]{@link Client#begin}.
   *
   * ```javascript
   *        var tx = client.begin(txId);
   *        //...
   *        tx.commit();
   * ```
   */
  commit(transactionId) {
    this._stompHandler.commit(transactionId);
  }
  /**
   * Abort a transaction.
   * It is preferable to abort a transaction by calling [abort]{@link ITransaction#abort} directly on
   * {@link ITransaction} returned by [client.begin]{@link Client#begin}.
   *
   * ```javascript
   *        var tx = client.begin(txId);
   *        //...
   *        tx.abort();
   * ```
   */
  abort(transactionId) {
    this._stompHandler.abort(transactionId);
  }
  /**
   * ACK a message. It is preferable to acknowledge a message by calling [ack]{@link IMessage#ack} directly
   * on the {@link IMessage} handled by a subscription callback:
   *
   * ```javascript
   *        var callback = function (message) {
   *          // process the message
   *          // acknowledge it
   *          message.ack();
   *        };
   *        client.subscribe(destination, callback, {'ack': 'client'});
   * ```
   */
  ack(messageId, subscriptionId, headers = {}) {
    this._stompHandler.ack(messageId, subscriptionId, headers);
  }
  /**
   * NACK a message. It is preferable to acknowledge a message by calling [nack]{@link IMessage#nack} directly
   * on the {@link IMessage} handled by a subscription callback:
   *
   * ```javascript
   *        var callback = function (message) {
   *          // process the message
   *          // an error occurs, nack it
   *          message.nack();
   *        };
   *        client.subscribe(destination, callback, {'ack': 'client'});
   * ```
   */
  nack(messageId, subscriptionId, headers = {}) {
    this._stompHandler.nack(messageId, subscriptionId, headers);
  }
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/compatibility/heartbeat-info.js
var HeartbeatInfo = class {
  constructor(client) {
    this.client = client;
  }
  get outgoing() {
    return this.client.heartbeatOutgoing;
  }
  set outgoing(value) {
    this.client.heartbeatOutgoing = value;
  }
  get incoming() {
    return this.client.heartbeatIncoming;
  }
  set incoming(value) {
    this.client.heartbeatIncoming = value;
  }
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/compatibility/compat-client.js
var CompatClient = class extends Client {
  /**
   * Available for backward compatibility, please shift to using {@link Client}
   * and [Client#webSocketFactory]{@link Client#webSocketFactory}.
   *
   * **Deprecated**
   *
   * @internal
   */
  constructor(webSocketFactory) {
    super();
    this.maxWebSocketFrameSize = 16 * 1024;
    this._heartbeatInfo = new HeartbeatInfo(this);
    this.reconnect_delay = 0;
    this.webSocketFactory = webSocketFactory;
    this.debug = (...message) => {
      console.log(...message);
    };
  }
  _parseConnect(...args) {
    let closeEventCallback;
    let connectCallback;
    let errorCallback;
    let headers = {};
    if (args.length < 2) {
      throw new Error("Connect requires at least 2 arguments");
    }
    if (typeof args[1] === "function") {
      [headers, connectCallback, errorCallback, closeEventCallback] = args;
    } else {
      switch (args.length) {
        case 6:
          [headers.login, headers.passcode, connectCallback, errorCallback, closeEventCallback, headers.host] = args;
          break;
        default:
          [headers.login, headers.passcode, connectCallback, errorCallback, closeEventCallback] = args;
      }
    }
    return [headers, connectCallback, errorCallback, closeEventCallback];
  }
  /**
   * Available for backward compatibility, please shift to using [Client#activate]{@link Client#activate}.
   *
   * **Deprecated**
   *
   * The `connect` method accepts different number of arguments and types. See the Overloads list. Use the
   * version with headers to pass your broker specific options.
   *
   * overloads:
   * - connect(headers, connectCallback)
   * - connect(headers, connectCallback, errorCallback)
   * - connect(login, passcode, connectCallback)
   * - connect(login, passcode, connectCallback, errorCallback)
   * - connect(login, passcode, connectCallback, errorCallback, closeEventCallback)
   * - connect(login, passcode, connectCallback, errorCallback, closeEventCallback, host)
   *
   * params:
   * - headers, see [Client#connectHeaders]{@link Client#connectHeaders}
   * - connectCallback, see [Client#onConnect]{@link Client#onConnect}
   * - errorCallback, see [Client#onStompError]{@link Client#onStompError}
   * - closeEventCallback, see [Client#onWebSocketClose]{@link Client#onWebSocketClose}
   * - login [String], see [Client#connectHeaders](../classes/Client.html#connectHeaders)
   * - passcode [String], [Client#connectHeaders](../classes/Client.html#connectHeaders)
   * - host [String], see [Client#connectHeaders](../classes/Client.html#connectHeaders)
   *
   * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
   */
  connect(...args) {
    const out = this._parseConnect(...args);
    if (out[0]) {
      this.connectHeaders = out[0];
    }
    if (out[1]) {
      this.onConnect = out[1];
    }
    if (out[2]) {
      this.onStompError = out[2];
    }
    if (out[3]) {
      this.onWebSocketClose = out[3];
    }
    super.activate();
  }
  /**
   * Available for backward compatibility, please shift to using [Client#deactivate]{@link Client#deactivate}.
   *
   * **Deprecated**
   *
   * See:
   * [Client#onDisconnect]{@link Client#onDisconnect}, and
   * [Client#disconnectHeaders]{@link Client#disconnectHeaders}
   *
   * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
   */
  disconnect(disconnectCallback, headers = {}) {
    if (disconnectCallback) {
      this.onDisconnect = disconnectCallback;
    }
    this.disconnectHeaders = headers;
    super.deactivate();
  }
  /**
   * Available for backward compatibility, use [Client#publish]{@link Client#publish}.
   *
   * Send a message to a named destination. Refer to your STOMP broker documentation for types
   * and naming of destinations. The headers will, typically, be available to the subscriber.
   * However, there may be special purpose headers corresponding to your STOMP broker.
   *
   *  **Deprecated**, use [Client#publish]{@link Client#publish}
   *
   * Note: Body must be String. You will need to covert the payload to string in case it is not string (e.g. JSON)
   *
   * ```javascript
   *        client.send("/queue/test", {priority: 9}, "Hello, STOMP");
   *
   *        // If you want to send a message with a body, you must also pass the headers argument.
   *        client.send("/queue/test", {}, "Hello, STOMP");
   * ```
   *
   * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
   */
  send(destination, headers = {}, body = "") {
    headers = Object.assign({}, headers);
    const skipContentLengthHeader = headers["content-length"] === false;
    if (skipContentLengthHeader) {
      delete headers["content-length"];
    }
    this.publish({
      destination,
      headers,
      body,
      skipContentLengthHeader
    });
  }
  /**
   * Available for backward compatibility, renamed to [Client#reconnectDelay]{@link Client#reconnectDelay}.
   *
   * **Deprecated**
   */
  set reconnect_delay(value) {
    this.reconnectDelay = value;
  }
  /**
   * Available for backward compatibility, renamed to [Client#webSocket]{@link Client#webSocket}.
   *
   * **Deprecated**
   */
  get ws() {
    return this.webSocket;
  }
  /**
   * Available for backward compatibility, renamed to [Client#connectedVersion]{@link Client#connectedVersion}.
   *
   * **Deprecated**
   */
  get version() {
    return this.connectedVersion;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledMessage]{@link Client#onUnhandledMessage}.
   *
   * **Deprecated**
   */
  get onreceive() {
    return this.onUnhandledMessage;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledMessage]{@link Client#onUnhandledMessage}.
   *
   * **Deprecated**
   */
  set onreceive(value) {
    this.onUnhandledMessage = value;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledReceipt]{@link Client#onUnhandledReceipt}.
   * Prefer using [Client#watchForReceipt]{@link Client#watchForReceipt}.
   *
   * **Deprecated**
   */
  get onreceipt() {
    return this.onUnhandledReceipt;
  }
  /**
   * Available for backward compatibility, renamed to [Client#onUnhandledReceipt]{@link Client#onUnhandledReceipt}.
   *
   * **Deprecated**
   */
  set onreceipt(value) {
    this.onUnhandledReceipt = value;
  }
  /**
   * Available for backward compatibility, renamed to [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}
   * [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
   *
   * **Deprecated**
   */
  get heartbeat() {
    return this._heartbeatInfo;
  }
  /**
   * Available for backward compatibility, renamed to [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}
   * [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
   *
   * **Deprecated**
   */
  set heartbeat(value) {
    this.heartbeatIncoming = value.incoming;
    this.heartbeatOutgoing = value.outgoing;
  }
};

// node_modules/@stomp/rx-stomp/node_modules/@stomp/stompjs/esm6/compatibility/stomp.js
var Stomp = class _Stomp {
  /**
   * This method creates a WebSocket client that is connected to
   * the STOMP server located at the url.
   *
   * ```javascript
   *        var url = "ws://localhost:61614/stomp";
   *        var client = Stomp.client(url);
   * ```
   *
   * **Deprecated**
   *
   * It will be removed in next major version. Please switch to {@link Client}
   * using [Client#brokerURL]{@link Client#brokerURL}.
   */
  static client(url, protocols) {
    if (protocols == null) {
      protocols = Versions.default.protocolVersions();
    }
    const wsFn = () => {
      const klass = _Stomp.WebSocketClass || WebSocket;
      return new klass(url, protocols);
    };
    return new CompatClient(wsFn);
  }
  /**
   * This method is an alternative to [Stomp#client]{@link Stomp#client} to let the user
   * specify the WebSocket to use (either a standard HTML5 WebSocket or
   * a similar object).
   *
   * In order to support reconnection, the function Client._connect should be callable more than once.
   * While reconnecting
   * a new instance of underlying transport (TCP Socket, WebSocket or SockJS) will be needed. So, this function
   * alternatively allows passing a function that should return a new instance of the underlying socket.
   *
   * ```javascript
   *        var client = Stomp.over(function(){
   *          return new WebSocket('ws://localhost:15674/ws')
   *        });
   * ```
   *
   * **Deprecated**
   *
   * It will be removed in next major version. Please switch to {@link Client}
   * using [Client#webSocketFactory]{@link Client#webSocketFactory}.
   */
  static over(ws) {
    let wsFn;
    if (typeof ws === "function") {
      wsFn = ws;
    } else {
      console.warn("Stomp.over did not receive a factory, auto reconnect will not work. Please see https://stomp-js.github.io/api-docs/latest/classes/Stomp.html#over");
      wsFn = () => ws;
    }
    return new CompatClient(wsFn);
  }
};
Stomp.WebSocketClass = null;

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-state.js
var RxStompState;
(function(RxStompState2) {
  RxStompState2[RxStompState2["CONNECTING"] = 0] = "CONNECTING";
  RxStompState2[RxStompState2["OPEN"] = 1] = "OPEN";
  RxStompState2[RxStompState2["CLOSING"] = 2] = "CLOSING";
  RxStompState2[RxStompState2["CLOSED"] = 3] = "CLOSED";
})(RxStompState || (RxStompState = {}));

// node_modules/@stomp/rx-stomp/esm6/rx-stomp.js
var __awaiter2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var RxStomp = class {
  /**
   * Constructor
   *
   * @param stompClient optionally inject the
   * [@stomp/stompjs]{@link https://github.com/stomp-js/stompjs}
   * {@link Client} to wrap. If this is not provided, a client will
   * be constructed internally.
   */
  constructor(stompClient) {
    this._queuedMessages = [];
    const client = stompClient ? stompClient : new Client();
    this._stompClient = client;
    const noOp = () => {
    };
    this._beforeConnect = noOp;
    this._correlateErrors = () => void 0;
    this._debug = noOp;
    this._connectionStatePre$ = new import_rxjs.BehaviorSubject(RxStompState.CLOSED);
    this._connectedPre$ = this._connectionStatePre$.pipe((0, import_operators.filter)((currentState) => {
      return currentState === RxStompState.OPEN;
    }));
    this.connectionState$ = new import_rxjs.BehaviorSubject(RxStompState.CLOSED);
    this.connected$ = this.connectionState$.pipe((0, import_operators.filter)((currentState) => {
      return currentState === RxStompState.OPEN;
    }));
    this.connected$.subscribe(() => {
      this._sendQueuedMessages();
    });
    this._serverHeadersBehaviourSubject$ = new import_rxjs.BehaviorSubject(null);
    this.serverHeaders$ = this._serverHeadersBehaviourSubject$.pipe((0, import_operators.filter)((headers) => {
      return headers !== null;
    }));
    this.stompErrors$ = new import_rxjs.Subject();
    this.unhandledMessage$ = new import_rxjs.Subject();
    this.unhandledReceipts$ = new import_rxjs.Subject();
    this.unhandledFrame$ = new import_rxjs.Subject();
    this.webSocketErrors$ = new import_rxjs.Subject();
  }
  /**
   * Instance of actual
   * [@stomp/stompjs]{@link https://github.com/stomp-js/stompjs}
   * {@link Client}.
   *
   * **Be careful in calling methods on it directly - you may get unintended consequences.**
   */
  get stompClient() {
    return this._stompClient;
  }
  /**
   * Set configuration. This method may be called multiple times.
   * Each call will add to the existing configuration.
   *
   * Example:
   *
   * ```javascript
   *        const rxStomp = new RxStomp();
   *        rxStomp.configure({
   *          brokerURL: 'ws://127.0.0.1:15674/ws',
   *          connectHeaders: {
   *            login: 'guest',
   *            passcode: 'guest'
   *          },
   *          heartbeatIncoming: 0,
   *          heartbeatOutgoing: 20000,
   *          reconnectDelay: 200,
   *          debug: (msg: string): void => {
   *            console.log(new Date(), msg);
   *          }
   *        });
   *        rxStomp.activate();
   * ```
   *
   * Maps to: [Client#configure]{@link Client#configure}
   */
  configure(rxStompConfig) {
    const stompConfig = Object.assign({}, rxStompConfig);
    if (stompConfig.beforeConnect) {
      this._beforeConnect = stompConfig.beforeConnect;
      delete stompConfig.beforeConnect;
    }
    if (stompConfig.correlateErrors) {
      this._correlateErrors = stompConfig.correlateErrors;
      delete stompConfig.correlateErrors;
    }
    this._stompClient.configure(stompConfig);
    if (stompConfig.debug) {
      this._debug = stompConfig.debug;
    }
  }
  /**
   * Initiate the connection with the broker.
   * If the connection breaks, as per [RxStompConfig#reconnectDelay]{@link RxStompConfig#reconnectDelay},
   * it will keep trying to reconnect.
   *
   * Call [RxStomp#deactivate]{@link RxStomp#deactivate} to disconnect and stop reconnection attempts.
   *
   * Maps to: [Client#activate]{@link Client#activate}
   */
  activate() {
    this._stompClient.configure({
      beforeConnect: () => __awaiter2(this, void 0, void 0, function* () {
        this._changeState(RxStompState.CONNECTING);
        yield this._beforeConnect(this);
      }),
      onConnect: (frame) => {
        this._serverHeadersBehaviourSubject$.next(frame.headers);
        this._changeState(RxStompState.OPEN);
      },
      onStompError: (frame) => {
        this.stompErrors$.next(frame);
      },
      onWebSocketClose: () => {
        this._changeState(RxStompState.CLOSED);
      },
      onUnhandledMessage: (message) => {
        this.unhandledMessage$.next(message);
      },
      onUnhandledReceipt: (frame) => {
        this.unhandledReceipts$.next(frame);
      },
      onUnhandledFrame: (frame) => {
        this.unhandledFrame$.next(frame);
      },
      onWebSocketError: (evt) => {
        this.webSocketErrors$.next(evt);
      }
    });
    this._stompClient.activate();
  }
  /**
   * Disconnect if connected and stop auto reconnect loop.
   * Appropriate callbacks will be invoked if underlying STOMP connection was connected.
   *
   * To reactivate you can call [RxStomp#activate]{@link RxStomp#activate}.
   *
   * Maps to: [Client#deactivate]{@link Client#deactivate}
   */
  deactivate() {
    return __awaiter2(this, void 0, void 0, function* () {
      this._changeState(RxStompState.CLOSING);
      yield this._stompClient.deactivate();
      this._changeState(RxStompState.CLOSED);
    });
  }
  /**
   * It will return `true` if STOMP broker is connected and `false` otherwise.
   */
  connected() {
    return this.connectionState$.getValue() === RxStompState.OPEN;
  }
  /**
   * If the client is active (connected or going to reconnect).
   *
   *  Maps to: [Client#active]{@link Client#active}
   */
  get active() {
    return this.stompClient.active;
  }
  /**
   * Send a message to a named destination. Refer to your STOMP broker documentation for types
   * and naming of destinations.
   *
   * STOMP protocol specifies and suggests some headers and also allows broker specific headers.
   *
   * `body` must be String.
   * You will need to covert the payload to string in case it is not string (e.g. JSON).
   *
   * To send a binary message body use binaryBody parameter. It should be a
   * [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).
   * Sometimes brokers may not support binary frames out of the box.
   * Please check your broker documentation.
   *
   * `content-length` header is automatically added to the STOMP Frame sent to the broker.
   * Set `skipContentLengthHeader` to indicate that `content-length` header should not be added.
   * For binary messages `content-length` header is always added.
   *
   * Caution: The broker will, most likely, report an error and disconnect if message body has NULL octet(s)
   * and `content-length` header is missing.
   *
   * The message will get locally queued if the STOMP broker is not connected. It will attempt to
   * publish queued messages as soon as the broker gets connected.
   * If you do not want that behavior,
   * please set [retryIfDisconnected]{@link IRxStompPublishParams#retryIfDisconnected} to `false`
   * in the parameters.
   * When `false`, this function will raise an error if message could not be sent immediately.
   *
   * Maps to: [Client#publish]{@link Client#publish}
   *
   * See: {@link IRxStompPublishParams} and {@link IPublishParams}
   *
   * ```javascript
   *        rxStomp.publish({destination: "/queue/test", headers: {priority: 9}, body: "Hello, STOMP"});
   *
   *        // Only destination is mandatory parameter
   *        rxStomp.publish({destination: "/queue/test", body: "Hello, STOMP"});
   *
   *        // Skip content-length header in the frame to the broker
   *        rxStomp.publish({"/queue/test", body: "Hello, STOMP", skipContentLengthHeader: true});
   *
   *        var binaryData = generateBinaryData(); // This need to be of type Uint8Array
   *        // setting content-type header is not mandatory, however a good practice
   *        rxStomp.publish({destination: '/topic/special', binaryBody: binaryData,
   *                         headers: {'content-type': 'application/octet-stream'}});
   * ```
   */
  publish(parameters) {
    const shouldRetry = parameters.retryIfDisconnected == null ? true : parameters.retryIfDisconnected;
    if (this.connected()) {
      this._stompClient.publish(parameters);
    } else if (shouldRetry) {
      this._debug(`Not connected, queueing`);
      this._queuedMessages.push(parameters);
    } else {
      throw new Error("Cannot publish while broker is not connected");
    }
  }
  /** It will send queued messages. */
  _sendQueuedMessages() {
    const queuedMessages = this._queuedMessages;
    this._queuedMessages = [];
    if (queuedMessages.length === 0) {
      return;
    }
    this._debug(`Will try sending  ${queuedMessages.length} queued message(s)`);
    for (const queuedMessage of queuedMessages) {
      this._debug(`Attempting to send ${queuedMessage}`);
      this.publish(queuedMessage);
    }
  }
  watch(opts, headers = {}) {
    const defaults = {
      subHeaders: {},
      unsubHeaders: {},
      subscribeOnlyOnce: false
    };
    let params;
    if (typeof opts === "string") {
      params = Object.assign({}, defaults, {
        destination: opts,
        subHeaders: headers
      });
    } else {
      params = Object.assign({}, defaults, opts);
    }
    this._debug(`Request to subscribe ${params.destination}`);
    const coldObservable = import_rxjs.Observable.create((messages) => {
      let stompSubscription;
      let stompConnectedSubscription;
      let connectedPre$ = this._connectedPre$;
      if (params.subscribeOnlyOnce) {
        connectedPre$ = connectedPre$.pipe((0, import_operators.take)(1));
      }
      const stompErrorsSubscription = this.stompErrors$.subscribe((error) => {
        const correlatedDestination = this._correlateErrors(error);
        if (correlatedDestination === params.destination) {
          messages.error(error);
        }
      });
      stompConnectedSubscription = connectedPre$.subscribe(() => {
        this._debug(`Will subscribe to ${params.destination}`);
        let subHeaders = params.subHeaders;
        if (typeof subHeaders === "function") {
          subHeaders = subHeaders();
        }
        stompSubscription = this._stompClient.subscribe(params.destination, (message) => {
          messages.next(message);
        }, subHeaders);
      });
      return () => {
        this._debug(`Stop watching connection state (for ${params.destination})`);
        stompConnectedSubscription.unsubscribe();
        stompErrorsSubscription.unsubscribe();
        if (this.connected()) {
          this._debug(`Will unsubscribe from ${params.destination} at Stomp`);
          let unsubHeaders = params.unsubHeaders;
          if (typeof unsubHeaders === "function") {
            unsubHeaders = unsubHeaders();
          }
          stompSubscription.unsubscribe(unsubHeaders);
        } else {
          this._debug(`Stomp not connected, no need to unsubscribe from ${params.destination} at Stomp`);
        }
      };
    });
    return coldObservable.pipe((0, import_operators.share)());
  }
  /**
   * STOMP brokers may carry out operation asynchronously and allow requesting for acknowledgement.
   * To request an acknowledgement, a `receipt` header needs to be sent with the actual request.
   * The value (say receipt-id) for this header needs to be unique for each use. Typically a sequence, a UUID, a
   * random number or a combination may be used.
   *
   * A complaint broker will send a RECEIPT frame when an operation has actually been completed.
   * The operation needs to be matched based in the value of the receipt-id.
   *
   * This method allow watching for a receipt and invoke the callback
   * when corresponding receipt has been received.
   *
   * The actual {@link Frame}
   * will be passed as parameter to the callback.
   *
   * Example:
   * ```javascript
   *        // Publishing with acknowledgement
   *        let receiptId = randomText();
   *
   *        rxStomp.watchForReceipt(receiptId, function() {
   *          // Will be called after server acknowledges
   *        });
   *        rxStomp.publish({destination: '/topic/special', headers: {receipt: receiptId}, body: msg});
   * ```
   *
   * Maps to: [Client#watchForReceipt]{@link Client#watchForReceipt}
   */
  watchForReceipt(receiptId, callback) {
    this._stompClient.watchForReceipt(receiptId, callback);
  }
  _changeState(state) {
    this._connectionStatePre$.next(state);
    this.connectionState$.next(state);
  }
};

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-rpc-config.js
var RxStompRPCConfig = class {
};

// node_modules/@stomp/rx-stomp/esm6/rx-stomp-rpc.js
var import_rxjs2 = __toESM(require_cjs());
var import_operators2 = __toESM(require_operators());
var import_angular2_uuid = __toESM(require_angular2_uuid());
var RxStompRPC = class {
  /**
   * Create an instance, see the [guide](/guide/rx-stomp/ng2-stompjs/remote-procedure-call.html) for details.
   */
  constructor(rxStomp, stompRPCConfig) {
    this.rxStomp = rxStomp;
    this.stompRPCConfig = stompRPCConfig;
    this._replyQueueName = "/temp-queue/rpc-replies";
    this._setupReplyQueue = () => {
      return this.rxStomp.unhandledMessage$;
    };
    this._customReplyQueue = false;
    if (stompRPCConfig) {
      if (stompRPCConfig.replyQueueName) {
        this._replyQueueName = stompRPCConfig.replyQueueName;
      }
      if (stompRPCConfig.setupReplyQueue) {
        this._customReplyQueue = true;
        this._setupReplyQueue = stompRPCConfig.setupReplyQueue;
      }
    }
  }
  /**
   * Make an RPC request.
   * See the [guide](/guide/rx-stomp/ng2-stompjs/remote-procedure-call.html) for example.
   *
   * It is a simple wrapper around [RxStompRPC#stream]{@link RxStompRPC#stream}.
   */
  rpc(params) {
    return this.stream(params).pipe((0, import_operators2.first)());
  }
  /**
   * Make an RPC stream request. See the [guide](/guide/rx-stomp/ng2-stompjs/remote-procedure-call.html).
   *
   * Note: This call internally takes care of generating a correlation id,
   * however, if `correlation-id` is passed via `headers`, that will be used instead.
   */
  stream(params) {
    const headers = Object.assign({}, params.headers || {});
    if (!this._repliesObservable) {
      const repliesObservable = this._setupReplyQueue(this._replyQueueName, this.rxStomp);
      if (this._customReplyQueue) {
        this._dummySubscription = repliesObservable.subscribe(() => {
        });
      }
      this._repliesObservable = repliesObservable;
    }
    return import_rxjs2.Observable.create((rpcObserver) => {
      let defaultMessagesSubscription;
      const correlationId = headers["correlation-id"] || import_angular2_uuid.UUID.UUID();
      defaultMessagesSubscription = this._repliesObservable.pipe((0, import_operators2.filter)((message) => {
        return message.headers["correlation-id"] === correlationId;
      })).subscribe((message) => {
        rpcObserver.next(message);
      });
      headers["reply-to"] = this._replyQueueName;
      headers["correlation-id"] = correlationId;
      this.rxStomp.publish(Object.assign(Object.assign({}, params), {
        headers
      }));
      return () => {
        defaultMessagesSubscription.unsubscribe();
      };
    });
  }
};

// node_modules/@stomp/ng2-stompjs/fesm2015/stomp-ng2-stompjs.js
var import_rxjs3 = __toESM(require_cjs());
var import_operators3 = __toESM(require_operators());
var StompState = {
  CLOSED: 0,
  TRYING: 1,
  CONNECTED: 2,
  DISCONNECTING: 3
};
StompState[StompState.CLOSED] = "CLOSED";
StompState[StompState.TRYING] = "TRYING";
StompState[StompState.CONNECTED] = "CONNECTED";
StompState[StompState.DISCONNECTING] = "DISCONNECTING";
var StompRService = class _StompRService extends RxStomp {
  constructor() {
    super();
    this.state = new import_rxjs3.BehaviorSubject(StompState.CLOSED);
    this.connectionState$.subscribe((st) => {
      this.state.next(_StompRService._mapStompState(st));
    });
  }
  /**
   * @param {?} st
   * @return {?}
   */
  static _mapStompState(st) {
    if (st === RxStompState.CONNECTING) {
      return StompState.TRYING;
    }
    if (st === RxStompState.OPEN) {
      return StompState.CONNECTED;
    }
    if (st === RxStompState.CLOSING) {
      return StompState.DISCONNECTING;
    }
    if (st === RxStompState.CLOSED) {
      return StompState.CLOSED;
    }
  }
  /**
   * Will trigger when connection is established. Use this to carry out initialization.
   * It will trigger every time a (re)connection occurs. If it is already connected
   * it will trigger immediately. You can safely ignore the value, as it will always be
   * StompState.CONNECTED
   * @return {?}
   */
  get connectObservable() {
    return this.connected$.pipe((0, import_operators3.map)((st) => {
      return _StompRService._mapStompState(st);
    }));
  }
  /**
   * Provides headers from most recent connection to the server as return by the CONNECTED
   * frame.
   * If the STOMP connection has already been established it will trigger immediately.
   * It will additionally trigger in event of reconnection, the value will be set of headers from
   * the recent server response.
   * @return {?}
   */
  get serverHeadersObservable() {
    return this.serverHeaders$;
  }
  /**
   * Will emit all messages to the default queue (any message that are not handled by a subscription)
   * @return {?}
   */
  get defaultMessagesObservable() {
    return this.unhandledMessage$;
  }
  /**
   * Will emit all receipts
   * @return {?}
   */
  get receiptsObservable() {
    return this.unhandledReceipts$;
  }
  /**
   * Will trigger when an error occurs. This Subject can be used to handle errors from
   * the stomp broker.
   * @return {?}
   */
  get errorSubject() {
    return this.stompErrors$;
  }
  /**
   * Set configuration
   * @param {?} config
   * @return {?}
   */
  set config(config) {
    const rxStompConfig = {};
    if (typeof config.url === "string") {
      rxStompConfig.brokerURL = config.url;
    } else {
      rxStompConfig.webSocketFactory = config.url;
    }
    rxStompConfig.heartbeatIncoming = config.heartbeat_in;
    rxStompConfig.heartbeatOutgoing = config.heartbeat_out;
    rxStompConfig.reconnectDelay = config.reconnect_delay;
    if (config.debug) {
      rxStompConfig.debug = (str) => {
        console.log(/* @__PURE__ */ new Date(), str);
      };
    }
    rxStompConfig.connectHeaders = config.headers;
    this.configure(rxStompConfig);
  }
  /**
   * It will connect to the STOMP broker.
   * @return {?}
   */
  initAndConnect() {
    this.deactivate();
    this.activate();
  }
  /**
   * It will disconnect from the STOMP broker.
   * @return {?}
   */
  disconnect() {
    this.deactivate();
  }
  /**
   * It will send a message to a named destination. The message must be `string`.
   *
   * The message will get locally queued if the STOMP broker is not connected. It will attempt to
   * publish queued messages as soon as the broker gets connected.
   *
   * @param {?} queueName
   * @param {?=} message
   * @param {?=} headers
   * @return {?}
   */
  publish(queueName, message, headers = {}) {
    if (typeof queueName === "string") {
      super.publish({
        destination: (
          /** @type {?} */
          queueName
        ),
        body: message,
        headers
      });
    } else {
      const pubParams = queueName;
      super.publish(pubParams);
    }
  }
  /**
   * It will subscribe to server message queues
   *
   * This method can be safely called even if the STOMP broker is not connected.
   * If the underlying STOMP connection drops and reconnects, it will resubscribe automatically.
   *
   * If a header field 'ack' is not explicitly passed, 'ack' will be set to 'auto'. If you
   * do not understand what it means, please leave it as is.
   *
   * Note that when working with temporary queues where the subscription request
   * creates the
   * underlying queue, messages might be missed during reconnect. This issue is not specific
   * to this library but the way STOMP brokers are designed to work.
   *
   * @param {?} queueName
   * @param {?=} headers
   * @return {?}
   */
  subscribe(queueName, headers = {}) {
    return this.watch(queueName, headers);
  }
  /**
   * STOMP brokers may carry out operation asynchronously and allow requesting for acknowledgement.
   * To request an acknowledgement, a `receipt` header needs to be sent with the actual request.
   * The value (say receipt-id) for this header needs to be unique for each use. Typically a sequence, a UUID, a
   * random number or a combination may be used.
   *
   * A complaint broker will send a RECEIPT frame when an operation has actually been completed.
   * The operation needs to be matched based in the value of the receipt-id.
   *
   * This method allow watching for a receipt and invoke the callback
   * when corresponding receipt has been received.
   *
   * The actual {\@link Frame}
   * will be passed as parameter to the callback.
   *
   * Example:
   * ```javascript
   *        // Publishing with acknowledgement
   *        let receiptId = randomText();
   *
   *        rxStomp.waitForReceipt(receiptId, function() {
   *          // Will be called after server acknowledges
   *        });
   *        rxStomp.publish({destination: TEST.destination, headers: {receipt: receiptId}, body: msg});
   * ```
   *
   * Maps to: [Client#watchForReceipt]{\@link Client#watchForReceipt}
   * @param {?} receiptId
   * @param {?} callback
   * @return {?}
   */
  waitForReceipt(receiptId, callback) {
    super.watchForReceipt(receiptId, callback);
  }
  /**
   * @return {?}
   */
  get client() {
    return this._stompClient;
  }
};
StompRService.decorators = [{
  type: Injectable
}];
StompRService.ctorParameters = () => [];
var StompConfig = class {
};
StompConfig.decorators = [{
  type: Injectable
}];
var StompService = class extends StompRService {
  /**
   * Constructor
   *
   * See README and samples for configuration examples
   * @param {?} config
   */
  constructor(config) {
    super();
    this.config = config;
    this.initAndConnect();
  }
};
StompService.decorators = [{
  type: Injectable
}];
StompService.ctorParameters = () => [{
  type: StompConfig
}];
var RxStompService = class extends RxStomp {
};
RxStompService.decorators = [{
  type: Injectable
}];
var InjectableRxStompRPCConfig = class extends RxStompRPCConfig {
};
InjectableRxStompRPCConfig.decorators = [{
  type: Injectable
}];
var InjectableRxStompRpcConfig = InjectableRxStompRPCConfig;
var RxStompRPCService = class extends RxStompRPC {
  /**
   * Create an instance, typically called by Angular Dependency Injection framework.
   *
   * @param {?} rxStomp
   * @param {?=} stompRPCConfig
   */
  constructor(rxStomp, stompRPCConfig) {
    super(rxStomp, stompRPCConfig);
  }
};
RxStompRPCService.decorators = [{
  type: Injectable
}];
RxStompRPCService.ctorParameters = () => [{
  type: RxStompService
}, {
  type: InjectableRxStompRPCConfig,
  decorators: [{
    type: Optional
  }]
}];
var InjectableRxStompConfig = class extends RxStompConfig {
};
InjectableRxStompConfig.decorators = [{
  type: Injectable
}];
function rxStompServiceFactory(rxStompConfig) {
  const rxStompService = new RxStompService();
  rxStompService.configure(rxStompConfig);
  rxStompService.activate();
  return rxStompService;
}
export {
  InjectableRxStompConfig,
  InjectableRxStompRPCConfig,
  InjectableRxStompRpcConfig,
  RxStompRPCService,
  RxStompService,
  StompConfig,
  StompHeaders,
  StompRService,
  StompService,
  StompState,
  rxStompServiceFactory
};
//# sourceMappingURL=@stomp_ng2-stompjs.js.map
