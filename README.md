# Kilem-Midi

Kilem-Midi 是個線上共同編輯音樂平台。

URL: [使用預設帳號進入](https://midi.kilem.site?test=kilem)

## Featrues and Website Demo

### Create a room

#### 特色: 
房間系統能夠創建共同編輯的房間，供以加入房間的人一起共同編輯。

#### 技術
* 使用關聯式資料庫處理人與房間互動關係，已加入房間、自己創建的房間以及公開的房間
* 簡易斷句搜尋引擎，快速查找已存在的公開房間

![](https://i.imgur.com/cqBuhs4.gif)

### Edit notes

#### 特色

在編輯器裡能夠新增、刪除、及編輯音樂的音符。

### 技術
* 畫面上的位置與時間的關係轉換邏輯處理
* 函式處理 midi 物件音軌內所紀錄的音符
* 編輯拖拉的邊界與重複音符邏輯處理
* 編輯後即時儲存於資料庫

![](https://i.imgur.com/WJKd6L6.gif)

![](https://i.imgur.com/O0vX9z7.gif)

### Set girds of notes length and alignment

#### 特色

提供選擇初始音符長度及格線對位基準的功能。

#### 技術

* 使用svg繪出格線
* 函式計算處理音符對位格線機制

![](https://i.imgur.com/8oW7BzE.gif)

### Play music in looping interval

#### 特色

循環播放播放選擇指定區間。

#### 技術

* 設定合適的播放解析度防止一個音符播多次的狀況。 ( 最後設定為64分音符 )
* 確認播放的速度符合 bpm 下的預期 ( bpm 120的狀況 1秒2個四分音符 )
* 判斷 loop 的開關及時間的開始及結束時間。

![](https://i.imgur.com/eiNXA2i.gif)

### Change Instrument of tracks

#### 特色

支持四種樂器的切換及使用。

#### 技術

* 利用 class 管理多個樂器的生成與使用，提高程式可維護性與共用性。

![](https://i.imgur.com/PVU1shJ.gif)

### Save version of tracks

#### 特色

* 可儲存版本，提供版本回溯的服務。

#### 技術

* 利用 socket 以同步新儲存版本的更新成果。
* 關聯資料庫紀錄音軌、使用者的明細。

![](https://i.imgur.com/72AVbii.gif)

### Edit bpm while playing

#### 特色
編輯 bpm 即時控制曲目速度與播放速度 ( 僅房主可使用 )

#### 技術

* 用函式處理循環區間位置、播放時間位置及播放解析度的重新計算。
* 用 socket 同步所有參加者的 bpm ，同時也重新計算以上項目。

![](https://i.imgur.com/wbXtXoK.gif)

### Operate Lock system for collaboration

#### 特色

操作上鎖機制與人協作音樂，透過聊天室系統互相溝通，避免音樂編輯上的衝突狀況。

#### 技術

* 考慮編輯衝突問題設計出來的機制。
* race condition問題，先鎖先贏的功能實現

![](https://i.imgur.com/1aigBTV.gif)

### Export midi file

#### 特色

匯出成果成midi檔，並使用其他軟體進行混音。

#### 技術

* 利用 Tone.js 將軌道及音符處理成midi檔案。
* 使儲存的音樂結構符合於 Tone.js 的輸出格式。

![](https://i.imgur.com/TgjHP6u.gif)


## Technologies

### Backend

* Node.js
* Express.js
* RESTful

### Web Socket

* socket io

### Database

* MySQL

### Frontend

* Javascriopt / HTML / CSS
* jQuery
* AJAX
* Audio Context
* Tone.js

### Cloud Service(AWS)

* EC2
* RDS
* S3
* CDN
* ELB
* Auto Scaling

### Networking

* HTTP & HTTPS
* DNS
* Nginx
* SSL Certificate (Cloudflare)

### Test

* Mocha
* Supertest
* Chai
* Sinon

### CI/CD

* Docker
* Jenkins

### Others

* Third party login: Google Oauth
* Design Parttern: MVC


## Structure

![](https://i.imgur.com/4TL8gFX.png)


## Database Design

![](https://i.imgur.com/bKYhjRf.png)