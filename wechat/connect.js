/**
 * 微信验证、微信消息接收
 */
const sha1 = require('sha1');
const Wechat = require('./wechat');
const util = require('../libs/util');

// 该导出函数用来管理微信接口
module.exports = (config, replyContent) => {
  // 先生成票据管理实例
  const wechat = new Wechat(config);

  // 后进行微信连接
  return async (ctx, next) => {
    // 微信验证规则：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319
    const token = config.token;

    const signature = ctx.query.signature;
    const nonce = ctx.query.nonce;
    const timestamp = ctx.query.timestamp;
    const echostr = ctx.query.echostr;

    const str = [token, timestamp, nonce].sort().join('');
    const sha = sha1(str);

    // 如果是 GET 请求，说明是连接请求
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr + '';
      } else {
        ctx.body = "不是微信的请求，拒绝处理";
        return false;
      }
    }
    // 如果是 POST　请求，说明是消息发送请求
    if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = "不是微信的请求，拒绝处理";
        return false;
      }

      // 由于微信发送过来的是 xml 格式的数据，而 koa 只解析 json 格式的数据，所以得不到数据内容
      // 这里引入了 koa-xml-body 来解析 xml
      const xml = ctx.request.body.xml;
      console.log(xml);
      console.log('');
      // 拿到 xml 数据后，需要进行格式化
      const msg = util.formatXML(xml);
      console.log(msg);
      console.log('');

      // 传入信息，进行回复操作
      wechat.reply(ctx, msg);
      
      // ctx.body = 'success';

      return true;
    }

    next();
  }
}