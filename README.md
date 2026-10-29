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
- `plugins/`: Vuetifyの登録
- `lib/`: 蔵書読込、LocalStorage、OpenBD連携
- `scripts/`: CSV検証・データ更新情報の生成
- `public/`: 静的アセットと蔵書・フォルダデータ
- `nuxt.config.js`: SPA・画面・ビルド設定

## 元データの更新

蔵書マネージャーから出力したファイルを、次の場所に直接配置・上書きしてください。UTF-8のタブ区切りデータを使用します。

- `public/dat_product.csv`: 蔵書データ。
- `public/dat_folder.csv`: フォルダデータ。

ZIPは配置不要です。旧形式の`dat_book.csv`も使用しません。

CSVを差し替えた後は`npm run dev`を再起動するか、`npm run build` / `npm run generate`を実行してください。配置したCSVを検証し、キャッシュ更新用の`public/library-data.json`を自動生成します。CSV自体は書き換えません。

開発サーバーの起動中など、更新情報の生成だけを実行する場合は次のコマンドを使い、その後ブラウザを再読込してください。

```sh
npm run data:prepare
```

必須列・IDの重複・フォルダ参照・階層の循環を検証し、不正な場合は起動・ビルドを中断します。`library-data.json`は自動生成されるため、直接編集する必要はありません。

ブラウザ起動時は更新情報を確認し、更新されていればCSVを再取得します。CSVの生バイトとキャッシュ内容はそれぞれSHA-256で照合し、版の食い違いや破損があるデータは表示・保存しません。検証処理はデータ生成時とブラウザで共通です。

LocalStorageにはヘッダーと行データのみを保存し、重複保存を避けています。設定画面の「リロード」で強制再取得できます。再取得・クリアが重なった場合は最新の操作を優先し、古い読込結果で上書きしません。

書籍詳細は元データのタイトル・著者・出版社・発売日・表紙URLを優先して表示します。表紙URLがない場合だけOpenBDで補足し、取得できなくても元データの書籍情報を表示します。

## 表示・通信

- 蔵書一覧は50件ずつ表示し、25・50・100件に切り替えられます。
- アプリ内リンクはページ全体を再読込せずに遷移します。
- フォルダ内の書籍はISBN順、フォルダ名は日本語の自然順で表示します。
- 存在しないフォルダは404、不正なISBNは400として扱います。`/book`のフォルダ指定がない場合や空の書籍一覧はトップへ戻ります。
- 通信は`lib/APIUtil.js`に統一し、10秒のタイムアウトを設定しています。詳細画面を離れるとOpenBDの補足リクエストを中止します。

`npm test`では、CSVの整合性、キャッシュの破損、再読込の競合、URL検証、ソート、通信処理を検証します。テストは一時ディレクトリに用意したデータを使い、`public/`の元CSVを書き換えません。
