[English](README.md) | 日本語

# VotifierX
[![npm](https://img.shields.io/npm/v/votifier-x)](https://www.npmjs.com/package/votifier-x)

TypeScriptによるシンプルな[Votifier](https://github.com/NuVotifier/NuVotifier)の実装です。Votifier v2プロトコルのスタンドアロンサーバーおよびクライアントを含みます。

## インストール
```bash
npm install votifier-x
```

## 使い方
### サーバー
```typescript
import { VotifierServer } from 'votifier-x';

const server = new VotifierServer({
  port: 8192, // オプション、デフォルトは 8192
  tokenPath: 'path/to/tokens.json', // オプション、デフォルトは 'tokens.json'
});
server.start();

server.on('vote', (vote) => {
  console.log(`${vote.username} が ${vote.address} から投票しました！`);
});
```

### クライアント
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

## トークンの仕様 (`tokens.json`)

サーバーは異なる投票サイトからの投票を認証するために `tokens.json` ファイルを使用します。これはキーが `serviceName` (サービス名)、値が対応するトークン文字列となる単純なキーバリュー型のJSONオブジェクトです。

```json
{
  "default": "auto-generated-token-string",
  "your-service-name": "another-token-here"
}
```

サーバーの起動時に指定された `tokenPath` のファイルが存在しない場合、サーバーは自動的に新しい設定ファイルを生成し、`default` トークンを1つ発行します。このトークンは、投票サイトにサーバーを登録する際に必要になります。

## 謝辞
- [NuVotifier](https://github.com/NuVotifier/NuVotifier)
- [Votifier(original)](https://github.com/vexsoftware/votifier)
- [votifier2-js](https://github.com/NuVotifier/votifier2-js) Votifier v2 のJavaScript実装
