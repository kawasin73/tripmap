# tripmap

## 利用するコンポーネント

### サーバー側

- Flask
- PostgreSQL
- PostGIS
- Google Place API

## API

|METHOD|PATH|入力|説明|
|:--|:--|:--|:--|
|`GET`|`/`|なし|トップページ。この中でSPAが動く|
|`POST`|`/clip/<user>`|パスの`<user>`に任意のユーザーIDを入れる。BodyはJSONで ` {'id': 'xxxxxx'}`|クリップを登録するJSON API|
|`GET`|`/places`|クエリパラメーターで、`lng`と`lat`と`size`を数値で入力|入力された地点に近い上位`{size}`件を一覧で返す JSON API|

## 作業コマンド

### heroku

```
# buildpacks
heroku buildpacks:set heroku/python

# migrate db
heroku run upgrade
# rollback db
heroku run downgrade
# psql
heroku pg:psql
```

### ローカル開発

```
# up postgres + postgis + webpack-dev-server
docker-compose up

# install pip
pipenv install

# migrate db
python manage.py db upgrade

# up server
python views.py
```

### 環境変数

|変数名|説明|
|:--|:--|
|`DATABASE_URL`|postgresqlのURL|
|`PLACE_API_KEY`|Google Place API の API key|

