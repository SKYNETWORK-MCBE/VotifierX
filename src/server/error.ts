export class VotifierError extends Error {
  public remoteAddress?: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ProtocolError extends VotifierError {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidChallengeError extends VotifierError {
  constructor(message: string = 'Challenge is not valid') {
    super(message);
  }
}

export class UnknownServiceError extends VotifierError {
  constructor(serviceName: string) {
    super(`Unknown service '${serviceName}'`);
  }
}

export class InvalidSignatureError extends VotifierError {
  constructor(message: string = 'Signature is not valid (invalid token?)') {
    super(message);
  }
}
