# mini-package-manager

Node.js / TypeScript で、学習用のミニパッケージマネージャーを自作するハンズオン用リポジトリです。

このプロジェクトでは、普段何気なく使っている `npm install` の裏側を理解するために、最小限のパッケージマネージャーを段階的に実装していきます。

## 目的

このリポジトリの目的は、npm や yarn のようなパッケージマネージャーを完全再現することではありません。

あくまで、以下の仕組みを自分で実装しながら理解することを目的としています。

* `package.json` の読み取り
* `dependencies` / `devDependencies` の扱い
* npm registry からの package manifest 取得
* semver によるバージョン解決
* tarball のダウンロード
* `node_modules` への展開
* lockfile の生成
* lockfile を使った再インストール
* 依存の依存の再帰的な解決
* バージョン衝突時の `node_modules` ネスト配置

## 作るもの

最終的には、以下のようなコマンドを作る予定です。

```bash
mini-pm install axios
mini-pm install typescript --save-dev
mini-pm install --production
```

ただし、現時点ではグローバルコマンドとして `mini-pm` を使う設定は行わず、まずは開発コマンドとして実行します。

```bash
npm run dev -- install axios
```

## このプロジェクトで扱う概念

### package.json

プロジェクトが必要とする依存パッケージを宣言するファイルです。

例:

```json
{
  "dependencies": {
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

`dependencies` は本番実行時にも必要な依存です。

`devDependencies` は開発時だけ必要な依存です。

### npm registry

npm パッケージの情報が置かれている場所です。

例えば `axios` の情報は、概念的には以下のような URL から取得できます。

```txt
https://registry.npmjs.org/axios
```

このレスポンスには、以下のような情報が含まれます。

* パッケージ名
* 最新バージョン
* 公開されているバージョン一覧
* 各バージョンの tarball URL
* 各バージョンの依存関係

### manifest

npm registry から取得できるパッケージのメタデータです。

このプロジェクトでは、便宜上このメタデータを `manifest` と呼びます。

manifest のイメージ:

```json
{
  "name": "axios",
  "dist-tags": {
    "latest": "1.7.0"
  },
  "versions": {
    "1.7.0": {
      "dist": {
        "tarball": "https://registry.npmjs.org/axios/-/axios-1.7.0.tgz"
      },
      "dependencies": {
        "follow-redirects": "^1.15.6"
      }
    }
  }
}
```

### semver

`^1.0.0` や `~1.2.0` のようなバージョン制約を解決する仕組みです。

例えば、`axios@^1.0.0` は `1.0.0` 固定ではありません。

`1.x.x` 系のうち、互換性がある範囲で新しいバージョンを選ぶ、という意味になります。

このプロジェクトでは `semver` パッケージを使ってバージョン解決を行います。

### node_modules

実際にダウンロードしたパッケージを配置するディレクトリです。

パッケージマネージャーは、npm registry から tarball をダウンロードし、それを展開して `node_modules` に配置します。

例:

```txt
node_modules/
  axios/
    package.json
    index.js
    dist/
```

### lockfile

実際に解決されたバージョンを記録するファイルです。

`package.json` は「この範囲のバージョンがほしい」という宣言です。

一方で lockfile は「実際にはこのバージョンを入れた」という確定結果です。

このプロジェクトでは、npm の `package-lock.json` に相当するものとして、以下のファイルを作る予定です。

```txt
mini-pm.lock.json
```

例:

```json
{
  "axios@^1.0.0": {
    "version": "1.7.0",
    "url": "https://registry.npmjs.org/axios/-/axios-1.7.0.tgz",
    "dependencies": {
      "follow-redirects": "^1.15.6"
    }
  }
}
```

## 現在のセットアップ状況

ここまでで、以下の作業を行っています。

```bash
npm init -y
npm install commander semver tar
```

インストール済みの主なパッケージは以下です。

### commander

CLI コマンドを作るためのライブラリです。

例えば、以下のようなコマンドを受け取るために使います。

```bash
npm run dev -- install axios
```

### semver

バージョン制約を解決するためのライブラリです。

例えば、以下のような指定から実際のバージョンを決めるために使います。

```txt
axios@^1.0.0
```

### tar

npm registry からダウンロードした `.tgz` ファイルを解凍するために使います。

npm パッケージの本体は tarball として配布されているため、これを展開して `node_modules` に配置します。

## 今後追加する開発用パッケージ

TypeScript で実装するため、次に以下を追加する予定です。

```bash
npm install -D typescript tsx @types/node @types/semver
```

それぞれの役割は以下です。

### typescript

TypeScript 本体です。

### tsx

開発中に `.ts` ファイルをそのまま実行するためのツールです。

例:

```bash
tsx src/cli.ts
```

### @types/node

Node.js の型定義です。

`fs`、`process`、`path` などを TypeScript で扱うために必要です。

### @types/semver

`semver` パッケージの型定義です。

## Git 管理

このプロジェクトは、ハンズオンの区切りごとに commit していきます。

最初に Git を初期化します。

```bash
git init
```

`node_modules` は Git 管理しないため、`.gitignore` を作成します。

```bash
touch .gitignore
```

`.gitignore` の内容:

```gitignore
node_modules/
dist/
.env
.DS_Store
```

初期状態を commit します。

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: initialize npm project"
```

## 推奨コミット単位

ハンズオンは段階的に進めるため、以下のような単位で commit していく予定です。

```bash
git commit -m "chore: initialize npm project"
git commit -m "chore: add TypeScript development tools"
git commit -m "chore: configure TypeScript"
git commit -m "chore: add source file structure"
git commit -m "feat: add basic install command"
git commit -m "feat: support install options"
git commit -m "refactor: move install logic to module"
git commit -m "feat: parse package json dependencies"
git commit -m "feat: fetch package manifest from npm registry"
git commit -m "feat: resolve package version with semver"
git commit -m "feat: parse package specifier"
git commit -m "feat: install package tarball"
git commit -m "feat: update package json dependencies"
git commit -m "feat: install dependencies from package json"
git commit -m "feat: recursively resolve dependencies"
git commit -m "feat: generate lockfile"
git commit -m "feat: resolve packages from lockfile"
git commit -m "feat: handle dependency version conflicts"
```

## 実装予定のファイル構成

最終的には以下のような構成にします。

```txt
src/
  cli.ts
  install.ts
  packageJson.ts
  npm.ts
  resolver.ts
  lockJson.ts
  logger.ts
  types.ts
  packageSpecifier.ts
```

各ファイルの責務は以下です。

### src/cli.ts

コマンドライン引数を受け取る入口です。

例えば、以下のような入力を受け取ります。

```bash
npm run dev -- install axios
```

CLI は、受け取った入力を `install.ts` に渡します。

### src/install.ts

`install` コマンド全体の流れを管理するファイルです。

主に以下を行います。

* `package.json` を読む
* lockfile を読む
* 追加パッケージを dependencies / devDependencies に追加する
* インストール対象を決める
* 依存解決を呼び出す
* パッケージを `node_modules` に展開する
* `package.json` を書き戻す
* lockfile を書き戻す

### src/packageJson.ts

`package.json` の読み書きを行います。

主に以下の処理を担当します。

* `dependencies` を読む
* `devDependencies` を読む
* パッケージ追加後に `package.json` を更新する

### src/npm.ts

npm registry との通信を担当します。

主に以下を行います。

* パッケージ manifest を取得する
* tarball をダウンロードする
* tarball を解凍して `node_modules` に展開する

### src/resolver.ts

依存解決を担当します。

主に以下を行います。

* semver によるバージョン解決
* manifest から tarball URL を取得
* パッケージの dependencies を読む
* 依存の依存を再帰的に解決する
* バージョン衝突を判定する

### src/lockJson.ts

lockfile の読み書きを担当します。

このプロジェクトでは以下のファイルを扱います。

```txt
mini-pm.lock.json
```

### src/logger.ts

ログ出力を担当します。

例:

```txt
[Resolve by manifest] axios@^1.0.0 to 1.7.0
[Installed] axios@1.7.0 > node_modules/axios
```

### src/types.ts

プロジェクト全体で使う型を定義します。

例:

```ts
export type PackageName = string
export type Version = string
export type VersionConstraint = string
```

### src/packageSpecifier.ts

`axios@^1.0.0` のような文字列を、パッケージ名とバージョン制約に分解します。

例えば、以下のように変換します。

```txt
axios
  -> name: axios
  -> constraint: null

axios@^1.0.0
  -> name: axios
  -> constraint: ^1.0.0

@types/node
  -> name: @types/node
  -> constraint: null

@babel/parser@^7.0.0
  -> name: @babel/parser
  -> constraint: ^7.0.0
```

## ハンズオンの進め方

### v0: CLI を作る

まずは `install` コマンドを受け取るだけの CLI を作ります。

目標:

```bash
npm run dev -- install axios
```

期待する出力:

```txt
install command called
packages: [ 'axios' ]
```

この段階では、まだ npm registry にはアクセスしません。

### v1: オプションを受け取る

次に `--save-dev` と `--production` を受け取れるようにします。

目標:

```bash
npm run dev -- --save-dev install typescript
```

期待する出力:

```txt
options: { saveDev: true, production: false }
```

### v2: install.ts に処理を切り出す

CLI は入力受付だけにして、実際の処理は `install.ts` に移します。

目的:

```txt
cli.ts
  コマンドライン引数を受け取る

install.ts
  install 処理本体を担当する
```

### v3: package.json を読む

`package.json` から `dependencies` と `devDependencies` を読み取ります。

例:

```json
{
  "dependencies": {
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

読み取り結果のイメージ:

```ts
{
  dependencies: {
    axios: "^1.0.0"
  },
  devDependencies: {
    typescript: "^5.0.0"
  }
}
```

### v4: npm registry から manifest を取得する

指定されたパッケージ名をもとに、npm registry から manifest を取得します。

例:

```bash
npm run dev -- install axios
```

取得する情報:

```txt
name: axios
latest: x.x.x
versions count: xxx
```

### v5: semver でバージョンを解決する

`axios@^1.0.0` のような指定から、実際にインストールするバージョンを決定します。

例:

```txt
axios@^1.0.0
  -> axios@1.x.x
```

### v6: パッケージ指定文字列を parse する

以下のような入力を正しく分解できるようにします。

```txt
axios
axios@^1.0.0
@types/node
@babel/parser@^7.0.0
```

特に、scope 付きパッケージは単純な `split("@")` では壊れるため、専用の parser を用意します。

### v7: tarball を node_modules に展開する

manifest に含まれる tarball URL から `.tgz` をダウンロードし、`node_modules` に展開します。

例:

```txt
node_modules/
  axios/
    package.json
    index.js
    dist/
```

### v8: package.json を更新する

`install axios` を実行したら、`package.json` の `dependencies` に追加します。

実行前:

```json
{
  "name": "mini-pm-demo",
  "version": "1.0.0"
}
```

実行後:

```json
{
  "name": "mini-pm-demo",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.x.x"
  }
}
```

`--save-dev` が指定された場合は `devDependencies` に追加します。

### v9: package.json に書かれた依存を install する

コマンド引数で指定されたパッケージだけでなく、`package.json` に書かれている依存もインストールできるようにします。

```bash
npm run dev -- install
```

通常時は以下をインストールします。

```txt
dependencies + devDependencies
```

`--production` 指定時は以下だけをインストールします。

```txt
dependencies
```

### v10: 依存の依存を再帰的に解決する

例えば `axios` を入れるだけでも、実際には `axios` が依存しているパッケージも必要です。

依存ツリーの例:

```txt
axios
  ├─ follow-redirects
  └─ form-data
      ├─ asynckit
      ├─ combined-stream
      └─ mime-types
```

このような依存の依存を再帰的に解決し、すべて `node_modules` に展開します。

### v11: lockfile を生成する

解決済みのバージョン情報を `mini-pm.lock.json` に保存します。

例:

```json
{
  "axios@^1.0.0": {
    "version": "1.7.0",
    "url": "https://registry.npmjs.org/axios/-/axios-1.7.0.tgz",
    "dependencies": {
      "follow-redirects": "^1.15.6"
    }
  }
}
```

### v12: lockfile から解決する

2回目以降の install では、registry から再解決するのではなく、lockfile に書かれているバージョンを優先します。

期待するログ:

```txt
[Resolve by lockfile] axios@^1.0.0 to 1.7.0
```

### v13: バージョン衝突に対応する

同じパッケージ名でも、依存元によって必要なバージョンが違う場合があります。

例:

```txt
root project wants estraverse@3.x
eslint-scope wants estraverse@4.x
esrecurse wants estraverse@5.x
```

この場合は、以下のように `node_modules` をネストして配置します。

```txt
node_modules/
  estraverse/
  eslint-scope/
    node_modules/
      estraverse/
  esrecurse/
    node_modules/
      estraverse/
```

これにより、依存元ごとに異なるバージョンを参照できるようになります。

## 実行方法

現時点では、グローバルコマンドとしての `mini-pm` 実行は行わず、開発コマンドとして実行します。

```bash
npm run dev -- install axios
```

または、別の検証用ディレクトリから実行する場合は、以下のようにします。

```bash
node --import tsx ../mini-package-manager/src/cli.ts install axios
```

## 注意事項

このプロジェクトは学習用です。

本物の npm / yarn / pnpm のような安全性・互換性・完全性はありません。

特に以下は未対応です。

* `peerDependencies`
* `optionalDependencies`
* `overrides`
* workspace
* `.bin` の作成
* integrity 検証
* npm scripts
* uninstall
* cache
* package.json の上位ディレクトリ探索
* npm registry 以外の registry
* private package
* 認証つき registry

## 今後やりたいこと

* `package.json` の探索を実装する
* `node_modules/.bin` を作る
* tarball の shasum / integrity 検証をする
* `mini-pm ci` のようなコマンドを作る
* lockfile と package.json の不整合チェックをする
* `uninstall` コマンドを作る
* 依存ツリーを可視化する

## まとめ

このプロジェクトでは、パッケージマネージャーの中心的な処理を小さく再実装します。

重要な流れは以下です。

```txt
package.json を読む
  ↓
npm registry から manifest を取得する
  ↓
semver で実際のバージョンを決める
  ↓
依存の依存を再帰的に解決する
  ↓
tarball をダウンロードする
  ↓
node_modules に展開する
  ↓
lockfile に解決結果を保存する
```

`npm install` は魔法ではなく、依存関係を解決して、必要なファイルをダウンロードし、`node_modules` に配置し、その結果を lockfile に固定する処理です。

このリポジトリでは、その仕組みを自分で実装しながら理解していきます。
