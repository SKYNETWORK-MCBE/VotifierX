import * as crypto from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class TokenManager {  
  private readonly tokenPath: string;

  private tokens: Map<string, string> = new Map();
  
  constructor(tokenPath: string) {
    this.tokenPath = tokenPath;
    this.load();
  }

  private load(): void {
    if (existsSync(this.tokenPath)) {
      const file = readFileSync(this.tokenPath, 'utf-8');
      this.tokens = new Map(Object.entries(JSON.parse(file)));
    } else {
      const defaultToken = this.generateToken();
      this.tokens.set('default', defaultToken);
      this.writeTokens();

      console.log('-'.repeat(75));
      console.log('[VotifierX]');
      console.log('No tokens were found in your tokenPath, so we\'ve generated one for you.');
      console.log('Your default Votifier token is ' + defaultToken);
      console.log('You will need to provide this token when you submit your server to a voting');
      console.log('list.');
      console.log('-'.repeat(75));
    }
  }

  private writeTokens() {
    writeFileSync(this.tokenPath, JSON.stringify(Object.fromEntries(this.tokens), null, 2));
  }

  public getToken(serviceName: string): string | undefined {
    return this.tokens.get(serviceName);
  }

  public setToken(serviceName: string, token: string): void {
    this.tokens.set(serviceName, token);
    this.writeTokens();
  }
  
  public generateToken(): string {
    const randomBytes = crypto.randomBytes(16); // 128 bit
    const bigInt = BigInt('0x' + randomBytes.toString('hex')) + BigInt(Math.floor(Math.random() * 2 ** 14)); // 130ビットにするために2^14を足す
    // 32進数に変換
    return bigInt.toString(32);
  }
}