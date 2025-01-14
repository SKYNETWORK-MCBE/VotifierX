import { VotifierClient } from '../src';

const client = new VotifierClient({
  host: 'localhost',
  port: 8192,
  token: '',
  serviceName: 'test',
  debug: false,
});

await client.sendVote({
  username: 'test user',
  address: '',
});

console.log('success')