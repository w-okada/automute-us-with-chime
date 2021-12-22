# Slack 連携

Slack からアプリを起動するための設定。[readme](../)のデプロイ手順を完了させたのちに、追加で行う。

# デプロイ

## Slack 設定その１

-   [slack api](https://api.slack.com/)から新規 Slack App 作成(Create new Slack App from scatch)を行う
    アプリ名はお好みで.
-   次の３つの情報を書き留めておく。
    -   Client ID
    -   Client Secret
    -   Signing Secret

## heroku の環境変数を設定

上で書き留めておいた情報を用いて heroku のコマンドで下記の環境変数を設定。

```
$ heroku config:set SLACK_CLIENT_ID=<Client ID>
$ heroku config:set SLACK_CLIENT_SECRET=<Client Secret>
$ heroku config:set SLACK_SIGNING_SECRET=<Signing Secret>
$ heroku config:set SLACK_STATE_SECRET=<お好みで>
```

## heroku の DB を設定

DB のテーブルを追加します

```
$ heroku pg:psql

::DATABASE=> CREATE TABLE auths (team_id varchar(16) primary key, data varchar(2048));
```

## Slack 設定その２

### create new slash command

Slash Commands -> Create New Command

```
command: /automute-us-with-chime
Request URL: <url of the heroku app>slack/events
Short Description: invoke amongus automute
```

### OAuth & Permissions

```
Redirect URLs:  <url of the heroku app>slack/oauth_redirect
Bot Token Scopes: commands, chat:write, users:read
```

### Manage Distribution

```
Remove Hard Coded Information: check
```

## Install Slack App

次のコマンドでインストール用の URL を表示させる。

```
$ heroku apps:info -s | grep web_url | cut -d= -f2 | xargs -I{} echo {}slack/install
```

表示された URL に行き、アプリをワークスペースにインストールしてください。

# Usag

```
/automute-us-with-chime <room name>
```

room name is anything ok.
