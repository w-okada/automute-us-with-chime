# AutoMuteUs with Amazon Chime

[AutoMuteUs](https://github.com/denverquane/automuteus)の機能に加えて、画面配信を行う機能を追加したツールです。Amazon Chime を用いて実現しています。Heroku にデプロイすることを前提として作成しています。Discord は不要です。

本家 AutoMuteUs と同様に[amonguscapture](https://github.com/automuteus/amonguscapture)が必要です。

# Requirement

-   ゲーム参加者の誰かひとりは amonguscapture を起動させておく必要があります。
-   Amazon Chime を使用するため AWS のアカウントが必要になります。
-   Heroku にデプロイするので Heroku にアカウントが必要になります。
-   npm が必要になります。

# Demo and Instruction Movie

not yet

# Deploy

以下、Linux あるいは wsl 上での作業を想定しています。プレイヤーのうち誰か一人が実施すれば良いです。

## AWS のアクセスキーの作成

次のリンクの内容に沿ってアクセスキーとシークレットアクセスキーを作成し、メモしておく。

[./doc/001_aws-accesskey_jp.md](./doc/001_aws-accesskey_jp.md)

## Heroku CLI のセットアップ

次の公式のチュートリアルに従い heroku cli をインストールする

[https://devcenter.heroku.com/ja/articles/heroku-cli](https://devcenter.heroku.com/ja/articles/heroku-cli)

## デプロイ

1. このリポジトリを clone して、フォルダの中に移動しておく。

```
$ git clone https://github.com/w-okada/automute-us-with-chime.git
$ cd automute-us-with-chime/
```

2. heroku にログインする

```
$ heroku login
```

    下記のメッセージが表示されたらエンターを押す。しばらくするとブラウザが開き、heroku のログイン画面が表示されるのでログインする

```
heroku: Press any key to open up the browser to login or q to exit:
```

3. Heroku App の作成する。`<APP NAME>`はお好みの名前で。

```
$ heroku create <APP NAME>
```

4. AWS のアクセスキーとシークレットアクセスキーを設定する。

```
$ heroku config:set AWS_ACCESS_KEY_ID=<ACCESS KEY>
$ heroku config:set AWS_SECRET_ACCESS_KEY=<SECRET ACCESS KEY>
```

5. アクセス用のパスワードを設定する。`<WEB SECRET>`は任意の文字列。

```
$ heroku config:set APP_WEB_SECRET=<WEB SECRET>
```

6. その他 Heroku の環境変数を設定する

```
$ heroku config:set APP_HEROKU_URL=$(heroku apps:info -s | grep web_url | cut -d= -f2)
```

7. DB 設定

    下記のコマンドで DB を用意する

```
$ heroku addons:create heroku-postgresql:hobby-dev
```

    DB のテーブルを作成する。下記のコマンドで DB のインタプリタを起動する。

```
$ heroku pg:psql
```

    "DATABASE=>"というプロンプトに対して次の二つの sql を実行する

```
CREATE TABLE rooms(room_name varchar(128) primary key, room_info varchar(20480));
CREATE TABLE accounts (username varchar(16) primary key, password varchar(2048));
```

    exit で DB のインタプリタを終了する

```
exit
```

8. ビルド

```
$ npm install
$ cd frontend && npm install && cd -
$ npm run build:all
```

9. デプロイ

```
$ git add . && git commit -m "update" && git push heroku master
```

10. URL 確認

```
$ heroku apps:info -s | grep web_url | cut -d= -f2 | xargs -I{} echo {}static/index.html
```

    表示された URL にアクセスするとアプリが起動する。

# 使い方

1. アプリにログインするまで。

    上記のデプロイで確認した URL に接続する。

    ![image](https://user-images.githubusercontent.com/48346627/146636036-4f91b311-814a-4f32-bead-cece938c7f97.png)

    最初に、画面下部の sign up からサインアップする。任意の username と password を設定してください。

    次に、roomname, username, password, web_secret を入力してください。
    room name は参加者（プレイヤー、観戦者）で同じものを入力。username, password はサインアップした時のもの。web_secret は上記デプロイ作業で設定したものを入力する。

    入力後 sign in ボタンを押すと、アプリの中に入ることができる。

2. amonguscapture を起動

    [amonguscapture](https://github.com/automuteus/amonguscapture)をダウンロードして起動する。

    among us 本体 も起動する。

    amonguscapture の左上のボタンを押してホストとコードを入力して、登録を押す。
    ホストはブラウザで開いた URL の末尾`static/index.html`を取り除いたもの。
    ブラウザで sign in する際に指定した room name を入力する。（※amonguscapture がフリーズする場合がある。この場合はタスクマネージャから amonguscapture を強制終了して、amonguscapture を再起動してください。）
    ![image](https://user-images.githubusercontent.com/48346627/146636256-3c3b6117-8177-4833-8624-5ed3287fb1d2.png)

    ![image](https://user-images.githubusercontent.com/48346627/146636283-4dd21c09-948a-4c63-ac05-711a7c2c0fa2.png)

3. ゲーム中の操作
   ![image](https://user-images.githubusercontent.com/48346627/146636810-414ab21c-a212-42b9-9520-1008bde92ab6.png)

# Disclaimer

本ソフトウェアの使用または使用不能により生じたいかなる直接損害・間接損害・波及的損害・結果的損害 または特別損害についても、一切責任を負いません。

# Copyright

see ./LICENSE

Copyright (c) 2021 Wataru Okada <wataru.okada@flect.co.jp>
