# 小説スターターキット ToDo

## 1. 作品情報

- [ ] `manifest.json` の作品タイトルを決める
- [ ] `manifest.json` のslugを決める
- [ ] 作品紹介文と読者層を決める
- [ ] `wrangler.jsonc` のWorker名を作品用に変更する

## 2. 物語設計

- [ ] `settings/characters.md` に主要人物を登録する
- [ ] `settings/story.md` に物語の核・時系列・章の役割を書く
- [ ] `settings/writing.md` に語り・文体・避ける表現を定める
- [ ] 章と話のIDを `manifest.json` に確定する
- [ ] 各話の本文先頭を `# ［C01-E01］話タイトル` 形式にする

## 3. 本文と素材

- [ ] `manuscript/` のプレースホルダーを本文へ置き換える
- [ ] `assets/` に必要な表紙・挿絵を追加する
- [ ] `archive/` と `revisions/` の扱いを決める
- [ ] 本文に設定メモや未確認の注釈を混ぜない

## 4. ビューアー

- [ ] `npm run build` が全話を生成することを確認する
- [ ] PCでサイドバー、目次、前後話リンクを確認する
- [ ] スマホでメニュー開閉と本文の文字サイズを確認する
- [ ] 直接URL（`?episode=C01-E01`）で話を開けることを確認する
- [ ] 公開前にタイトル・description・OGP方針を決める

## 5. Cloudflare公開

- [ ] Cloudflare Workersプロジェクトを作成する
- [ ] Gitリポジトリと連携する
- [ ] ビルドコマンドを `npm run build` にする
- [ ] `wrangler.jsonc` の `./dist` が静的アセットとして使われることを確認する
- [ ] workers.dev URLまたはカスタムドメインを決める
- [ ] 公開範囲（公開／Access制限）を決める
- [ ] mainへの更新で自動デプロイされることを確認する

## 6. リリース

- [ ] `npm test`
- [ ] `npm run build`
- [ ] 公開URLで12話の読書順を確認する
- [ ] 本文・設定・公開情報にプレースホルダーが残っていないことを確認する

