import { VotifierServer } from '../src';

const server = new VotifierServer({ port: 8193 });
server.start();

server.on('vote', (vote) => {
  console.log(vote);
});

server.on('error', err => {
  console.error(err);
});