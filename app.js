const Koa = require('koa');
const xmlParser  = require('koa-xml-body');
const views = require('koa-views');

const wechatConnect = require('./wechat/connect');
const config = require('./config');

const app = new Koa();

app.use(views(__dirname, '/'));
app.use(xmlParser());
app.use(wechatConnect(config));

app.listen(80);
console.log('App ready at 80 port');