# novel-template

Markdownで小説本文を管理し、Cloudflare Workersで読むためのスターターキットです。

本文・人物・設定はプロジェクトごとに置き換えます。テンプレート自体には特定作品の本文や個人情報を入れません。

## まず触る場所

| 場所 | 役割 |
| --- | --- |
| `manifest.json` | 作品情報、章・話のID、読書順、本文パス |
| `manuscript/` | 1話1Markdownの小説本文 |
| `settings/` | 人物、物語、執筆、公開設定 |
| `src/` | 読書ビューアー |
| `scripts/build-viewer.mjs` | Markdown→公開データ変換 |
| `wrangler.jsonc` | Cloudflare Workers設定 |
| `TODO.md` | 作品化・公開までの作業一覧 |

初期状態では4章×3話、全12話のプレースホルダーを用意しています。

## ローカル確認

```bash
npm run build
npm test
python3 -m http.server 4173 --directory dist
```

ブラウザで <http://127.0.0.1:4173> を開きます。話を直接開く場合は
`?episode=C01-E01` のように指定します。

## Cloudflare公開

1. Cloudflare Workersプロジェクトを作成し、このリポジトリと接続する。
2. ビルドコマンドを `npm run build` にする。
3. `wrangler.jsonc` のWorker名を作品用に変更する。
4. `dist/` を静的アセットとしてデプロイする。
5. `settings/publishing.md` の公開URL・公開範囲を埋める。

手動デプロイの場合:

```bash
npm run build
npx wrangler deploy
```

## 運用

- `manifest.json` を読書順の唯一の正本にする。
- 本文は `manuscript/`、設定は `settings/` に置く。
- 生成物 `dist/` は直接編集しない。
- `dev` → 作業ブランチ → PR → `dev` → `main` の順でリリースする。
- 秘密情報やCloudflareの認証情報をリポジトリへ保存しない。

詳細は [AGENTS.md](AGENTS.md)、[INDEX.md](INDEX.md)、[TODO.md](TODO.md) を参照してください。

