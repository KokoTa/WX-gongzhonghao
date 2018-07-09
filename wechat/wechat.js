/**
 * 微信功能处理：凭证管理，回复管理
 */
const axios = require('axios');
const util = require('../libs/util');
const fs = require('fs');
const FormData = require('form-data');

// access_token 处理函数
function Wechat(config) {
  const opts = config.wechat;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  const api = config.api;
  this.api = api;

  this.getAccessToken().then((data) => {
    // 本地查找 token，找到就解析，找不到就重新获取
    try {
      data = JSON.parse(data);
    } catch(e) {
      return this.updateAccessToken();
    }
    // 检查合法性，合法就保存，不合法就重新获取
    if (this.isValidAccessToken(data)) {
      return data;
    } else {
      return this.updateAccessToken();
    }
  }).then((data) => {
    console.log(data);
    this.access_token = data.access_token;
    this.expires_in = data.expires_in;
    
    this.saveAccessToken(data);
  })
}

// 验证 token 合法性
// PS:原型方法不要用箭头函数，this 的指向会有问题
Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }

  const access_token = data.access_token;
  const expires_in = data.expires_in;
  const now = (new Date().getTime());
  // 未超时返回 true，超时返回 false
  if (now < expires_in) {
    console.log('access_token 未超时');
    return true;
  } else {
    console.log('access_token 已超时');
    return false;
  }
}

// 更新 token
Wechat.prototype.updateAccessToken = function() {
  const appID = this.appID;
  const appSecret = this.appSecret;
  const api = this.api;
  const url = `${api.accessTokenUrl}&appid=${appID}&secret=${appSecret}`;

  return axios.get(url).then((res) => {
    if (res.data) {
      const data = res.data;
      const expires_in = (data.expires_in - 20) * 1000 + new Date().getTime(); // 希望提前 20 秒更新 token

      data.expires_in = expires_in; // 更新过期时间

      return data;
    }
  })
}

// 消息回复(不需要用到access_token)
Wechat.prototype.reply = async function(ctx, msg) {
  const xml = await util.formatReplyInfo(msg, this); // 格式化回复信息
  
  ctx.status = 200;
  ctx.type = 'application/xml';
  ctx.body = xml;
}

// 上传临时素材
Wechat.prototype.uploadTemple = function(filePath, type) {
  const api = this.api;
  // 判断access_token合法性
  return this.getAccessToken().then((data) => {
    if (this.isValidAccessToken(JSON.parse(data))) {
      const url = `${api.uploadTempleUrl}access_token=${this.access_token}&type=${type}`;

      // https://cnodejs.org/topic/57e17beac4ae8ff239776de5
      const form = new FormData();
      form.append('media', fs.createReadStream(filePath), '01.jpg'); // 这里 media 字段是对应文档的
      form.getLength((err, length) => {
        if (err) return err;
        const res = axios.post(url, form, {
          headers: Object.assign({ 'Content-Length':length }, form.getHeaders()) // 当数据是 stream 的时候，并没有自动设置content-length；form-data 格式下的 content-type 会有额外的 boundary
        });
        return res.data;
      });
    } else {
      console.log('access_token 已超时');
    }
  });
}

module.exports = Wechat;