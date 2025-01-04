import { VotifierServer } from '../src';

const server = new VotifierServer({ port: 8193 });
server.start();

server.on('listen', async () => {
  console.log('Votifier server has started');
});
server.on('error', () => {});

let count = 0;
server.on('vote', () => {
  count++;
})

let delta = Date.now();
setInterval(() => {
  console.log(`${count} votes/s, delta: ${Date.now() - delta}`);
  count = 0;
  delta = Date.now();
}, 1000);
