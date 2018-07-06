const axios = require('axios');
//https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183
const api = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential';


// access_token 处理函数
function Wechat(opts) {
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  this.getAccessToken().then((data) => {
    // 本地查找 token，找到就解析，找不到就重新获取
    try {
      data = JSON.parse(data);
    } catch(e) {
      return this.updateAccessToken();
    }
    // 检查合法性，合法就保存，不合法就重新获取
    if (this.isValidAccessToken(data)) {
      Promise.resolve(data);
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
    return true;
  } else {
    return false;
  }
}

// 更新 token
Wechat.prototype.updateAccessToken = function() {
  const appID = this.appID;
  const appSecret = this.appSecret;
  const url = `${api}&appid=${appID}&secret=${appSecret}`;

  return axios.get(url).then((res) => {
    if (res.data) {
      const data = res.data;
      const expires_in = data.expires_in - 20; // 希望提前 20 秒更新 token

      data.expires_in = expires_in; // 更新过期时间

      return data;
    }
  })
}

module.exports = Wechat;