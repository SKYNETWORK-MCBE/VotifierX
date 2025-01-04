import { EventEmitter } from 'events';
import { createServer, Server, Socket } from 'net';
import { TokenManager } from './tokens';
import { magicV2 } from '../constants';
import type { VotifierMessage, VotifierPayload, VotifierResponse } from '../types';
import { createHmac } from 'crypto';

export interface VotifierServerOptions {
  /** Path of the token file. Defaults to 'tokens.json' */
  tokenPath?: string;

  /** Port to listen vote requests. Defaults to 8192 */
  port?: number;
}

const defaultOptions: VotifierServerOptions = {
  tokenPath: 'tokens.json',
  port: 8192,
}

export class VotifierServer extends EventEmitter {
  public readonly server: Server = createServer();

  public readonly options: VotifierServerOptions;

  public readonly protocolVersion: number = 2;

  public readonly tokenManager: TokenManager;
  
  constructor(options?: VotifierServerOptions) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.tokenManager = new TokenManager(this.options.tokenPath!);

    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('error', this.emit.bind(this, 'error'));
  }

  private handleConnection(socket: Socket): void {
    const challenge = this.tokenManager.generateToken();
    const greeting = `VOTIFIER ${this.protocolVersion} ${challenge}\n`;
    socket.write(greeting);

    const handleError = (error: Error) => {
      const errorResponse: VotifierResponse = {
        status: 'error',
        error: error.message,
        cause: error.name,
      }
      socket.write(JSON.stringify(errorResponse));
      socket.destroy();
      socket.removeAllListeners();
      this.emit('error', error);
    }

    const handleData = (data: Buffer) => {
      let payload: VotifierPayload;
      try {
        payload = this.decode(data, challenge);
      } catch (error: any) {
        return handleError(error);
      }

      const response: VotifierResponse = { status: 'ok' };
      socket.write(JSON.stringify(response));
      socket.end();
      socket.destroy();

      this.emit('vote', payload);
    }
    
    socket.once('data', handleData);
    socket.on('error', handleError);
  }

  private decode(data: Buffer, challenge: string): VotifierPayload {
    const magic = data.readUInt16BE(0);
    if (magic !== magicV2) {
      throw new Error('This server only accepts well-formed Votifier v2 packets.');
    }

    const messageLength = data.readUInt32BE(2);
    const serializedMessage = data.subarray(4, 4 + messageLength).toString();
    
    const message: VotifierMessage = JSON.parse(serializedMessage);
    const payload: VotifierPayload = JSON.parse(message.payload);

    // verify challenge
    if (payload.challenge !== challenge) {
      throw new Error('Challenge is not valid');
    }

    let token = this.tokenManager.getToken(payload.serviceName);
    if (!token) {
      token = this.tokenManager.getToken('default');
      if (!token) {
        throw new Error(`Unknown service '${payload.serviceName}'`);
      }
    }

    // verify signature, decode
    const serverSignature = createHmac('sha256', token)
      .update(message.payload)
      .digest('base64');
    
    if (message.signature !== serverSignature) {
      throw new Error('Signature is not valid (invalid token?)');
    }

    return payload;
  }

  public start(): void {
    this.server.listen(this.options.port, () => {
      this.emit('listen');
    });
  }

  public stop(): void {
    this.server.close();
  }
}

export interface VotifierServer {
  on(event: 'listen', listener: () => void): this;
  on(event: 'vote', listener: (vote: VotifierPayload) => void): this;
  on(event: 'error', listener: () => void): this;
}
