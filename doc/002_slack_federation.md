# Slack Federation

Invoke application from slack slash command. follow the procedure below after the deploy proceduer described in [readme](../)

# Deploy

## Slack Setting 1

-   Create new Slack App from scatch in the [slack api](https://api.slack.com/)
    App name and workplace is anythin ok you want.
-   Write down basic information of the app.
    -   Client ID
    -   Client Secret
    -   Signing Secret

## Setup heroku environment variables

Using the information you wrote down, please set the following environment variables in the heroku command.

```
$ heroku config:set SLACK_CLIENT_ID=<Client ID>
$ heroku config:set SLACK_CLIENT_SECRET=<Client Secret>
$ heroku config:set SLACK_SIGNING_SECRET=<Signing Secret>
$ heroku config:set SLACK_STATE_SECRET=<any string you want>
```

## setup heroku DB

add the new table to DB.

```
$ heroku pg:psql

::DATABASE=> CREATE TABLE auths (team_id varchar(16) primary key, data varchar(2048));
```

## Slack Setting 2

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

Use the following command to display the URL for installation.

```
$ heroku apps:info -s | grep web_url | cut -d= -f2 | xargs -I{} echo {}slack/install
```

Go to the URL displayed and install the app on your workspace.

# Usag

```
/automute-us-with-chime <room name>
```

room name is anything ok.
