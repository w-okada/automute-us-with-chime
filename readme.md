# AutoMuteUs with Amazon Chime

[JAPANESE](./readme_jp.md)

This is a tool that adds the functionality to deliver screens in addition to the functionality of [AutoMuteUs](https://github.com/denverquane/automuteus). It is implemented using Amazon Chime. It is designed to be deployed on Heroku, so Discord is not required.

It requires [amonguscapture](https://github.com/automuteus/amonguscapture) as well as the original AutoMuteUs.

# Requirement

-   One of the game participants needs to have amonguscapture running.
-   You will need an AWS account to use Amazon Chime.
-   You will need a Heroku account to deploy to Heroku.
-   You will need npm.

# Demo and Instruction Movie

not yet

# Deploy

The following assumes that you are working on Linux or wsl. It only needs to be done by one of the players.

## Generate AWS Access key

Create an access key and secret access key according to the following links and write them down.

[./doc/001_aws-accesskey_jp.md](./doc/001_aws-accesskey_jp.md)

## setup Heroku CLI

Follow this official tutorial to install heroku cli

[https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/ja/articles/heroku-cli)

## Deploy

1. Clone this repository and move into a folder.

```
$ git clone https://github.com/w-okada/automute-us-with-chime.git
$ cd automute-us-with-chime/
```

2. login heroku

```
$ heroku login
```

    When you see the following message, press enter. After a while, your browser will open and you will see the heroku login screen.

```
heroku: Press any key to open up the browser to login or q to exit:
```

3. Create Heroku App. `<APP NAME>` can be any name you like.

```
$ heroku create <APP NAME>
```

4. Set the AWS access key and secret access key.

```
$ heroku config:set AWS_ACCESS_KEY_ID=<ACCESS KEY>
$ heroku config:set AWS_SECRET_ACCESS_KEY=<SECRET ACCESS KEY>
```

5. Set a password for access. `<WEB SECRET>` can be any string.

```
$ heroku config:set APP_WEB_SECRET=<WEB SECRET>
```

6. Setting other Heroku environment variables

```
$ heroku config:set APP_HEROKU_URL=$(heroku apps:info -s | grep web_url | cut -d= -f2)
```

7. Setup DB

    Prepare the DB with the following command

```
$ heroku addons:create heroku-postgresql:hobby-dev
```

    Create a DB table. Start the DB interpreter with the following command.

```
$ heroku pg:psql
```

    Run the following two sql against the prompt "DATABASE=>"

```
CREATE TABLE rooms(room_name varchar(128) primary key, room_info varchar(20480));
CREATE TABLE accounts (username varchar(16) primary key, password varchar(2048));
```

    Exit the DB interpreter with exit

```
exit
```

8. Build

```
$ npm install
$ cd frontend && npm install && cd -
$ npm run build:all
```

9. Deploy

```
$ git add . && git commit -m "update" && git push heroku master
```

10. URL

```
$ heroku apps:info -s | grep web_url | cut -d= -f2 | xargs -I{} echo {}static/index.html
```

    Accessing the displayed URL will launch the application.

# Usage

1. Until you login the app.

    Connect to the URL confirmed in the above deployment.

    ![image](https://user-images.githubusercontent.com/48346627/146636036-4f91b311-814a-4f32-bead-cece938c7f97.png)

    First, sign up using the sign up link at the bottom of the screen. Set up a username and password of your choice.

    Next, enter the roomname, username, password, and web_secret.
    The room name should be the same for both participants (players and spectators). username and password should be the ones you used when you signed up. web_secret should be the one you set in the deployment process above.

    After entering the information, click the sign in button to enter the application.

2. run amonguscapture

    Download [amonguscapture](https://github.com/automuteus/amonguscapture) and run it.

    You should also run among us.

    Press the top left button of amonguscapture, enter the host and code, and press register.
    The host is the URL opened in the browser without the `static/index.html` at the end.
    Enter the room name as the code that you specified when you signed in with your browser.（※In some cases, amonguscapture may freeze. In this case, please kill amonguscapture from task manager and restart amonguscapture.）
    ![image](https://user-images.githubusercontent.com/48346627/146636256-3c3b6117-8177-4833-8624-5ed3287fb1d2.png)

    ![image](https://user-images.githubusercontent.com/48346627/146636283-4dd21c09-948a-4c63-ac05-711a7c2c0fa2.png)

3. Usage in game
   ![image](https://user-images.githubusercontent.com/48346627/146639664-e1abb1f5-dfb2-4223-b21e-05417671a441.png)
