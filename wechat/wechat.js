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

// 上传素材
Wechat.prototype.uploadMaterial = function(filePath, type, permanent = false, obj = {}) {
  const api = this.api;
  // 判断access_token合法性
  return new Promise((resolve, reject) => {
    this.getAccessToken().then((data) => {
      if (this.isValidAccessToken(JSON.parse(data))) {
        let url = `${api.uploadTempleUrl}access_token=${this.access_token}&type=${type}`;
        // 是否永久素材
        if (permanent) {
          console.log('Is permanent');
          url = `${api.uploadPermanentUrl}access_token=${this.access_token}&type=${type}`;
        }

        // https://cnodejs.org/topic/57e17beac4ae8ff239776de5
        const form = new FormData();
        form.append('media', fs.createReadStream(filePath)); // 这里 media 字段是对应文档的

        // 是否永久视频
        if (permanent && type === 'video') {
          form.append('description', obj.jsonString);
        }

        // 是否永久图文素材内容中的图片
        if (permanent && type === 'image' && obj.alias === 'news') {
          url = `${api.uploadNewsImage}access_token=${this.access_token}`;
        }
        // 是否永久图文素材
        if (permanent && type === 'news') {
          url = `${api.uploadNews}access_token=${this.access_token}`;
          axios.post(url, obj.articles)
            .then((res) => {
              console.log(res.data);
              resolve(res.data);
            });
        } else {
          form.getLength((err, length) => {
            if (err) reject(err);

            axios.post(url, form, {
              headers: Object.assign({ 'Content-Length':length }, form.getHeaders()) // 当数据是 stream 的时候，并没有自动设置content-length；form-data 格式下的 content-type 会有额外的 boundary
            }).then((res) => {
              console.log(res.data);
              resolve(res.data);
            });
          });
        }

      } else {
        throw new Error('access_token 已超时');
      }
    }).catch(err => console.log(err));
  })
}

// 获取素材
Wechat.prototype.getMaterial = function(media_id, type, permanent = false) {
  const api = this.api;
  return new Promise((resolve, reject) => {
    this.getAccessToken().then(async (data) => {
      if (this.isValidAccessToken(JSON.parse(data))) {
        const url = `${api.getTempleUrl}access_token=${this.access_token}&media_id=${media_id}`;
        const options = {
          method: 'get',
          url: url,
          responseType: 'arraybuffer',
        };

        // 是否是永久素材
        if (permanent) {
          url = `${api.getPermanentUrl}access_token=${this.access_token}`;
          options.data = {
            media_id,
          };
        }
        
        // 视频文件不支持https下载，调用该接口需http协议
        if (type === 'video') {
          url.replace('https', 'http');
        }

        axios(options).then((res) => resolve(res.data));

      } else {
        throw new Error('access_token 已超时');
      }
    }).catch(err => console.log(err));
  })
}

Wechat.prototype.downloadMaterial = async function(data) {
  if (Buffer.isBuffer(data)) {
    const buffer = Buffer.from(data);
    await fs.writeFile('./xx.jpg', buffer, (err) => {
      if (err) err;
      console.log('图片下载成功');
    });
  }
  else if (typeof data === 'object') {
    const url = data.video_url;
    const options = {
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
    };
    await axios(options).then(async (res) => {
      const buffer = Buffer.from(res.data);
      fs.writeFile('./xx.mp4', buffer, (err) => {
        if (err) err;
        console.log('视频下载成功');
      });
    })
  }
}

module.exports = Wechat;