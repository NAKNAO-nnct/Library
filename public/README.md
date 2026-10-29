# Public assets

このディレクトリのファイルはURLのルートから配信します。
`dat_product.csv`と`dat_folder.csv`はタブ区切りの蔵書・フォルダデータです。
この2ファイルを直接配置・上書きしてください。ZIPと旧形式の`dat_book.csv`は不要です。

`library-data.json`は起動・ビルド前、または`npm run data:prepare`で自動生成します。CSV自体は書き換えません。
