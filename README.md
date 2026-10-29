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
npm test
npm run build
npm run start
```

静的ホスティング向けには`npm run generate`を実行し、`.output/public`を配信します。SPAの深いURLは`200.html`へフォールバックさせてください。`404.html`もNuxtが生成します。

## 構成

- `pages/`: 蔵書一覧、フォルダ、書籍詳細、設定
- `layouts/`: 共通レイアウト
- `plugins/`: VuetifyとNuxt注入用Axios
- `lib/`: 蔵書読込、LocalStorage、OpenBD連携
- `scripts/`: ZIPからのデータ取込
- `public/`: 静的アセットと蔵書・フォルダデータ
- `nuxt.config.js`: SPA・画面・ビルド設定

## 元データの更新

ルートの`蔵書マネージャー.zip`を元データとして管理します。ZIPの中のファイルはUTF-8のタブ区切りです。

- `dat_product.csv`: 蔵書データ。旧`dat_book.csv`の全書籍と追加分、表紙URLなどを含みます。
- `dat_folder.csv`: フォルダデータ。
- `dat_book.csv`: 旧形式のデータ。取込には使用しません。

ZIPを差し替えた後は`npm run dev`を再起動するか、`npm run build` / `npm run generate`を実行してください。これらのコマンドは起動・ビルド前にZIPを検証し、`public/dat_product.csv`、`public/dat_folder.csv`、`public/library-data.json`を自動生成します。生成したファイルを直接編集しないでください。

取込だけを実行する場合は次のコマンドを使います。

```sh
npm run data:import
```

必須列・IDの重複・フォルダ参照・階層の循環を検証し、不正な場合は取込を中断します。macOSの濁点分離を含むZIPファイル名にも対応します。

ブラウザ起動時はデータのハッシュを確認し、更新されていればLocalStorageを置き換えます。保存するのはヘッダーと行データのみで、列名付きデータとの重複保存を避けています。設定画面の「リロード」でも配信中のデータを再取得できます。

書籍詳細は元データのタイトル・著者・出版社・発売日・表紙URLを優先して表示します。表紙URLがない場合だけOpenBDで補足し、取得できなくても元データの書籍情報を表示します。

## 別途対応する既存課題

次の2点は今回のデータ対応と分けて対応します。TSVパーサーと再取得処理は新データへの対応で修正済みです。

- フォルダ内ISBNソートの`ibsn`参照
- Nuxt注入用AxiosとAPIUtilのAxiosが別インスタンスである点
