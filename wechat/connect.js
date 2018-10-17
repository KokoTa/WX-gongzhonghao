/**
 * 微信验证、微信消息接收
 */
const sha1 = require('sha1');
const Wechat = require('./wechat');
const Sign = require('../sdk/sign');
const util = require('../libs/util');

// 该导出函数用来管理微信接口
module.exports = (config) => {
  // 先生成票据管理实例
  const wechat = new Wechat(config);

  // 后进行微信连接
  return async (ctx, next) => {
    // 微信验证规则：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319
    const token = config.wechat.token;

    const signature = ctx.query.signature;
    const nonce = ctx.query.nonce;
    const timestamp = ctx.query.timestamp;
    const echostr = ctx.query.echostr;

    const str = [token, timestamp, nonce].sort().join('');
    const sha = sha1(str);

    if (ctx.method === 'GET') {
      // 如果请求中带有参数且通过参数获得对应的签名，则说明是微信服务器的连接请求
      if (sha === signature) {
        console.log('Get connect sign');
        ctx.body = echostr + '';
      }
      // 否则就是页面或API请求
      else {
        // 请求 index
        if (ctx.path === '/index') {
          console.log('Path is: /index');
          await ctx.render('index.pug');
        }
        // 获取JS-SDK签名
        else if (ctx.path === '/sign') {
          // 注意传入的 url 是请求的来源页
          console.log('referer', ctx.request.header.referer);
          if (ctx.request.header.referer) {
            const obj = Sign(wechat.ticket, ctx.request.header.referer.split('#')[0]);
            ctx.body = obj;
          } else {
            ctx.body = "获取签名失败";
          }
        }
        else {
          ctx.body = "非法路径，拒绝处理";
        }
        return false;
      }
    }
    
    
    if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = "不是微信的请求，拒绝处理";
        return false;
      }

      // 由于微信发送过来的是 xml 格式的数据，而 koa 只解析 json 格式的数据，所以得不到数据内容
      // 这里引入了 koa-xml-body 来解析 xml
      const xml = ctx.request.body.xml;
      // 拿到 xml 数据后，需要进行格式化
      const msg = util.formatXML(xml);
      console.log(msg);

      // 传入信息，进行回复操作
      await wechat.reply(ctx, msg);
      
      // ctx.body = 'success';

      return true;
    }

    next();
  }
}