const Koa = require('koa');
const path = require('path');
const util = require('./libs/util');
const xmlParser  = require('koa-xml-body');

const wechatConnect = require('./wechat/connect');
const accessTokenFile = path.join(__dirname, './wechat/accessTokenFile.txt');
const config = {
  wechat: { // 对应公众平台上的参数
    appID: 'wx475c09b524a46560',
    appSecret: 'e92d22149d5a3ef19b8f6102b642737e',
    token: 'KokoTa',
    getAccessToken() {
      return util.readFileAsync(accessTokenFile);
    },
    saveAccessToken(data) {
      data = JSON.stringify(data);
      return util.writeFileAsync(accessTokenFile, data);
    }
  }
} 

const app = new Koa();

app.use(xmlParser());
app.use(wechatConnect(config.wechat));

app.listen(80);
console.log('App ready at 80 port');