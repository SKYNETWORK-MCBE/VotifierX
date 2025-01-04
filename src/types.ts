export interface VoteOptions {
  username: string;
  address: string;
  serviceName?: string;
  timestamp?: number;
  additionalData?: string | Buffer;
}

export interface VotifierPayload {
  serviceName: string;
  username: string;
  address: string;
  timestamp: number;
  challenge: string;
  additionalData?: string;
}

export interface VotifierMessage {
  payload: string;
  signature: string;
}

export type VotifierResponse = {
  status: 'error';
  cause: string;
  error: string;
} | {
  status: 'ok';
}