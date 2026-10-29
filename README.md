# Library

Nuxt 4・Vue 3・Vuetify 4による蔵書閲覧アプリです。ブラウザで動作するSPAで、Dockerは使用しません。

## 開発環境

- Node.js 24.22.2
- npm 12.2.1
- バージョン管理: [Volta](https://docs.volta.sh/guide/getting-started)

`package.json`の`volta`設定により、このディレクトリでは指定バージョンが選択されます。

```sh
npm ci
# LocalStorageのキーを変更する場合のみ .env.sample を .env にコピー
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

## 検証・ビルド

```sh
npm run lint
npm run build
npm run start
```

静的ホスティング向けには`npm run generate`を実行し、`.output/public`を配信します。SPAの深いURLは`200.html`へフォールバックさせてください。`404.html`もNuxtが生成します。

## 構成

- `pages/`: 蔵書一覧、フォルダ、書籍詳細、設定
- `layouts/`: 共通レイアウト
- `plugins/`: VuetifyとNuxt注入用Axios
- `lib/`: 蔵書読込、LocalStorage、OpenBD連携
- `public/`: 静的アセットと蔵書・フォルダデータ
- `nuxt.config.js`: SPA・画面・ビルド設定

`public/dat_book.csv`と`public/dat_folder.csv`は拡張子にかかわらずタブ区切りです。初回読込時にLocalStorageへ保存します。書籍詳細はOpenBD APIから取得します。

## 別途対応する既存課題

今回の実行環境・フレームワーク更新とは分けて対応します。

- フォルダ内ISBNソートの`ibsn`参照
- TSVパーサーの列処理に行数を使用している点
- 保存済みデータの再取得と設定画面のリロード仕様
- Nuxt注入用AxiosとAPIUtilのAxiosが別インスタンスである点
