import { VotifierClient } from '../src';

const client = new VotifierClient({
  host: 'localhost',
  port: 8192,
  token: '649qt2k8otskeah7jrtbf8kbcb',
  serviceName: 'test',
  debug: false,
});

await client.sendVote({
  username: 'test user',
  address: 'address',
});

console.log('success')