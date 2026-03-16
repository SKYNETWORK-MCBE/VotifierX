English | [日本語](README_ja.md)

# VotifierX
[![npm](https://img.shields.io/npm/v/votifier-x)](https://www.npmjs.com/package/votifier-x)

A simple [Votifier](https://github.com/NuVotifier/NuVotifier) implementation in TypeScript. Including standalone server and client of Votifier v2 protocol.

## Installation
```bash
npm install votifier-x
```

## Usage
### Server
```typescript
import { VotifierServer } from 'votifier-x';

const server = new VotifierServer({
  port: 8192, // optional, default is 8192
  tokenPath: 'path/to/tokens.json', // optional, default is 'tokens.json'
});
server.start();

server.on('vote', (vote) => {
  console.log(`Received vote from ${vote.username} at ${vote.address}`);
});
```

### Client
```typescript
import { VotifierClient } from 'votifier-x';

const client = new VotifierClient({
  host: '0.0.0.0',
  port: 8192,
  token: 'your-token',
  serviceName: 'your-service-name',
});

await client.sendVote({
  username: 'username',
  address: 'address',
});
```

## Tokens Configuration (`tokens.json`)

The server uses a `tokens.json` file to authenticate incoming votes from different voting lists. It is a simple key-value JSON object where keys are the `serviceName` and values are the corresponding token strings.

```json
{
  "default": "auto-generated-token-string",
  "your-service-name": "another-token-here"
}
```

If the specified `tokenPath` file does not exist when the server starts, the server will automatically generate a new configuration file containing a single `default` token. You will need to provide this token when you register your server on a voting list.

## Acknowledgements
- [NuVotifier](https://github.com/NuVotifier/NuVotifier)
- [Votifier(original)](https://github.com/vexsoftware/votifier)
- [votifier2-js](https://github.com/NuVotifier/votifier2-js) Votifier v2 implementation in JavaScript
