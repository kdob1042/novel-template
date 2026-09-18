# 小説テンプレート索引

## 正本

- `manifest.json`: 作品情報、章・話のID、読書順、ソースパス
- `manuscript/`: 小説本文
- `settings/`: 登場人物、物語構成、執筆方針、公開設定

## 生成

- `scripts/build-viewer.mjs`: Markdown原稿を公開用JSONへ変換
- `src/novel-app.js`: 読書画面のクライアント
- `src/novel-style.css`: PC／スマホ用の読書UI
- `dist/`: Cloudflare Workersで配信する生成物

## 初期構成

4章×3話、全12話の空スロットを用意しています。章数・話数を変える場合は、
まず `manifest.json` と `manuscript/` の対応を更新してください。

