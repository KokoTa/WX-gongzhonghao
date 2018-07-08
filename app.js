const Koa = require('koa');
const xmlParser  = require('koa-xml-body');

const wechatConnect = require('./wechat/connect');
const config = require('./config');

const app = new Koa();

app.use(xmlParser());
app.use(wechatConnect(config.wechat));

app.listen(80);
console.log('App ready at 80 port');