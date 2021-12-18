# AWS のアクセスキー作成

## ユーザ作成とアクセスキーの確認

1. AWS のコンソールにログインして IAM サービスに入ってください。

    ![image](https://user-images.githubusercontent.com/48346627/146634877-06b33517-ef9d-4575-a7af-8ac76168dadc.png)

2. メニューからユーザを選択

    ![image](https://user-images.githubusercontent.com/48346627/146634911-231c9c5b-6cd0-4518-b69d-60921c793654.png)

3. ユーザを追加を選択

![image](https://user-images.githubusercontent.com/48346627/146634940-0f171478-4807-4cd8-aa9a-cdf2adc92a46.png)

4. お好みのユーザ名を入力し、AWS 認証情報タイプはアクセスキー、プログラムによるアクセスを選択

![image](https://user-images.githubusercontent.com/48346627/146634975-a7b982b2-7f84-44a1-bc7a-e187ef470cdf.png)

5. アクセス許可の設定で、既存ポリシーを直接アタッチを選択し、AmazonChimeSDK を選択

![image](https://user-images.githubusercontent.com/48346627/146635025-983d7162-ddfd-4150-aad6-8c344ff162ad.png)

6. 以降、次へのステップを押して、ユーザ作成完了まで進める。下記の画面で(1)アクセスキーと(2)シークレットアクセスキーが表示されるのでメモしておく。ここでメモし忘れた場合は、ユーザ一覧から再生成することができる。
   ![image](https://user-images.githubusercontent.com/48346627/146635155-cd41d389-d822-47dd-b89c-72e2256debbe.png)
