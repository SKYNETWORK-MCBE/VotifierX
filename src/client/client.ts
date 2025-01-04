import { readFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { createHmac } from 'node:crypto';
import type { VoteOptions, VotifierMessage, VotifierPayload, VotifierResponse } from '../types';
import { magicV2 } from '../constants';

export interface VotifierClientOptions {
  token: string;
  serviceName: string;
  host: string;
  /** Defaults to 8192 */
  port?: number;
  protocol?: 2;
  debug?: boolean;
}

export class VotifierClient {
  public readonly host: string;

  public readonly port: number = 8192;

  public readonly token: string;
  
  public readonly protocolVersion: number = 2;
  
  public serviceName: string;

  public readonly debug: boolean = false;

  constructor(options: VotifierClientOptions) {
    this.token = options.token;
    this.serviceName = options.serviceName;
    this.host = options.host;
    if (options.port) this.port = options.port;
    if (options.protocol) this.protocolVersion = options.protocol;
    if (options.debug) this.debug = options.debug;
  }

  private getToken(path?: string): string {
    if (!path) throw new Error('Token or token path is required');
    return readFileSync(path, 'utf-8');
  } 
  
  public sendVote(vote: VoteOptions) {
    return new Promise<void>((resolve, reject) => {
      const socket = createConnection(this.port, this.host);
      socket.setTimeout(5000, () => {
        socket.destroy();
        handleError(new Error('Connection timeout'));
      });

      const handleError = (error: Error) => {
        socket.destroy();
        socket.removeAllListeners();
        reject(error);
      }

      const handleGreeting = (data: Buffer) => {
        const greeting = data.toString();
        if (this.debug) console.log('[S->C] Greeting:', greeting);

        const headers = greeting.split(' ');
        if (headers.length !== 3) {
          return handleError(new Error('Not a v2 protocol server'));
        }

        const payload: VotifierPayload = {
          username: vote.username,
          address: vote.address,
          timestamp: vote.timestamp ?? Date.now(),
          serviceName: vote.serviceName ?? this.serviceName,
          challenge: headers[2]!.trim(),
          additionalData: (typeof vote.additionalData === 'string' ? Buffer.from(vote.additionalData) : vote.additionalData)?.toString('base64'),
        };
        if (this.debug) console.log('[C->S] Payload:', payload, payload.challenge.length);
        const serializedPayload = JSON.stringify(payload);

        const signature = createHmac('sha256', this.token)
          .update(serializedPayload)
          .digest('base64');

        const message: VotifierMessage = {
          payload: serializedPayload,
          signature
        };
        const serializedMessage = JSON.stringify(message);

        const buffer = Buffer.alloc(4 + serializedMessage.length);
        buffer.writeUInt16BE(magicV2, 0);
        buffer.writeUInt16BE(serializedMessage.length, 2);
        buffer.write(serializedMessage, 4);

        socket.write(new Uint8Array(buffer));
        socket.once('data', handleResponse);
      }

      const handleResponse = (data: Buffer) => {
        let response: VotifierResponse;
        try {
          response = JSON.parse(data.toString());
        } catch (error) {
          throw new Error('Failed to parse response');
        }

        if (this.debug) console.log('[S->C] Response:', response);

        socket.end();
        socket.removeAllListeners();

        if (response.status === 'ok') {
          resolve();

        } else if (response.status === 'error') {
          const err = new Error(response.error);
          err.name = response.cause;
          handleError(err);

        } else {
          handleError(new Error('Unknown response'));
        }
      }

      socket.once('data', handleGreeting);
      socket.once('error', handleError);
    });
  }
}

// export function sendVote() {}.
/*
func (client *V2Client) SendVote(vote Vote) error {
	conn, err := dial(client.address)
	if err != nil {
		return err
	}
	defer conn.Close()

	greeting := make([]byte, 64)
	read, err := conn.Read(greeting)
	if err != nil {
		return fmt.Errorf("error reading greeting: %w", err)
	}

	parts := bytes.Split(greeting[:read-1], []byte(" "))
	if len(parts) != 3 {
		return errors.New("not a v2 server")
	}
	challenge := string(parts[2])

	serialized, err := vote.EncodeV2(client.token, challenge)
	if err != nil {
		return fmt.Errorf("error encoding vote: %w", err)
	}
	_, err = conn.Write(serialized)
	if err != nil {
		return fmt.Errorf("failed to send vote: %w", err)
	}

	// read response
	resBuf := make([]byte, 256)
	read, err = conn.Read(resBuf)
	if err != nil {
		return fmt.Errorf("error reading response: %w", err)
	}

	var res v2Response
	rd := bytes.NewReader(resBuf[:read])
	err = json.NewDecoder(rd).Decode(&res)
	if err != nil {
		return fmt.Errorf("error decoding response: %w", err)
	}

	if !strings.EqualFold(res.Status, "ok") {
		return fmt.Errorf("remote server error: %w", &remoteError{
			cause: res.Cause,
			err:   errors.New(res.Error),
		})
	}

	return nil
}

type remoteError struct {
	cause string
	err   error
}

func (e *remoteError) Error() string {
	return fmt.Sprintf("%s: %s", e.cause, e.err)
}

func (e *remoteError) Unwrap() error {
	return e.err
}
*/