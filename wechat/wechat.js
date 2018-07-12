/**
 * 微信功能处理
 */
const axios = require('axios');
const util = require('../libs/util');
const fs = require('fs');
const FormData = require('form-data');

/**
 * access_token 处理函数
 * @param {Object} config 微信配置对象 
 */
function Wechat(config) {
  const opts = config.wechat;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;
  this.getTicket = opts.getTicket;
  this.saveTicket = opts.saveTicket;

  const api = config.api;
  this.api = api;

  this.fetchAccessToken();
  this.fetchTicket();
}

/**
 * 获取 access_token
 */
Wechat.prototype.fetchAccessToken = function() {
  return this.getAccessToken().then((data) => {
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

    this.saveAccessToken(data);
  })
}

/**
 * 验证 access_token 合法性
 * PS:原型方法不要用箭头函数，this 的指向会有问题
 * @param {Object} data 凭证对象
 */
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

/**
 * 更新 access_token
 */
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

/**
 * 获取 js-sdk ticket
 */
Wechat.prototype.fetchTicket = function() {
  return this.getTicket().then((data) => {
    try {
      data = JSON.parse(data);
    } catch(e) {
      return this.updateTicket();
    }
    // 检查合法性，合法就保存，不合法就重新获取
    if (this.isValidTicket(data)) {
      return data;
    } else {
      return this.updateTicket();
    }
  }).then((data) => {
    console.log(data);
    this.ticket = data.ticket;

    this.saveTicket(data);
  })
}

/**
 * 验证 ticket 合法性
 * @param {Object} data ticket对象
 */
Wechat.prototype.isValidTicket = function(data) {
  if (!data || !data.ticket || !data.expires_in) {
    return false;
  }

  const expires_in = data.expires_in;
  const now = (new Date().getTime());
  // 未超时返回 true，超时返回 false
  if (now < expires_in) {
    console.log('ticket 未超时');
    return true;
  } else {
    console.log('ticket 已超时');
    return false;
  }
}

/**
 * 更新 ticket
 */
Wechat.prototype.updateTicket = function() {
  const api = this.api;
  const url = `${api.getTicket}access_token=${this.access_token}`;

  return axios.get(url).then((res) => {
    if (res.data) {
      const data = res.data;
      const expires_in = (data.expires_in - 20) * 1000 + new Date().getTime(); // 希望提前 20 秒更新 token

      data.expires_in = expires_in; // 更新过期时间

      return data;
    }
  })
}

/**
 * 消息回复(不需要用到access_token)
 * @param {Object} ctx 上下文对象 
 * @param {Object} msg 微信发送过来的信息对象
 */
Wechat.prototype.reply = async function(ctx, msg) {
  const xml = await util.formatReplyInfo(msg, this); // 格式化回复信息
  
  ctx.status = 200;
  if (xml) {
    ctx.type = 'application/xml';
    ctx.body = xml;
  } else {
    ctx.body = 'success';
  }
}

/**
 * 上传素材
 * @param {String} filePath 将要上传的素材地址 
 * @param {String} type 类型
 * @param {Boolean} permanent 是否永久素材 
 * @param {Object} obj 永久素材额外参数
 */
Wechat.prototype.uploadMaterial = function(filePath, type, permanent = false, obj = {}) {
  const api = this.api;
  // 判断access_token合法性
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then(() => {
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
    }).catch(err => console.log(err));
  })
}

/**
 * 获取素材
 * @param {String} media_id 素材ID
 * @param {String} type 类型
 * @param {Boolean} permanent 是否永久素材 
 */
Wechat.prototype.getMaterial = function(media_id, type, permanent = false) {
  const api = this.api;
  return new Promise((resolve, reject) => {
    this.getAccessToken().then(async (data) => {
      if (this.isValidAccessToken(JSON.parse(data))) {
        let url = `${api.getTempleUrl}access_token=${this.access_token}&media_id=${media_id}`;
        const options = {
          method: 'get',
          url: url,
          responseType: 'arraybuffer',
        };

        // 是否是永久素材
        if (permanent) {
          url = `${api.getPermanentUrl}access_token=${this.access_token}`;
          option.method = 'post';
          options.data = {
            media_id,
          };
        }
        
        // 临时视频文件不支持https下载，调用该接口需http协议
        if (!permanent && type === 'video') {
          url.replace('https', 'http');
        }

        axios(options).then((res) => resolve(res.data));

      } else {
        throw new Error('access_token 已超时');
      }
    }).catch(err => console.log(err));
  })
}

/**
 * 下载素材
 * @param {Buffer | Object} data 下载的数据或链接 
 */
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

/**
 * 获取永久素材列表
 * @param {String} type 类型 
 * @param {Number} offset 偏移量
 * @param {Number} count 数量
 */
Wechat.prototype.getMaterialList = function(type = 'image', offset = 0, count = 20) {
  const api = this.api;
  const url = `${api.getMaterialList}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
    data: {
      type,
      offset,
      count,
    }
  };

  return axios(options).then((res) => res.data);
}

/**
 * 删除永久素材
 * @param {String} media_id 素材ID
 */
Wechat.prototype.delMaterail = function(media_id) {
  const api = this.api;
  const url = `${api.delMaterial}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
    data: {
      media_id,
    }
  };

  return axios(options).then((res) => res.data);
}

/**
 * 创建用户标签
 * @param {String} tagName 
 */
Wechat.prototype.createTag = function(tagName) {
  const api = this.api;
  const url = `${api.createTag}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
    data: {
      tag: {
        name: tagName
      }
    }
  };

  return axios(options).then((res) => res.data);
}

/**
 * 获取用户标签
 */
Wechat.prototype.getTag = function() {
  const api = this.api;
  const url = `${api.getTag}access_token=${this.access_token}`;
  const options = {
    method: 'get',
    url
  };

  return axios(options).then((res) => res.data);
}

/**
 * 给用户打标签
 * @param {String} openid 
 */
Wechat.prototype.batchTag = function(openid) {
  const api = this.api;
  const url = `${api.batchTag}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
    data: {   
      openid_list : [//粉丝列表    
        openid 
      ],   
      tagid : 100 
    }
  };

  return axios(options).then((res) => res.data);
}

/**
 * 获取用户列表
 */
Wechat.prototype.getUser = function () {
  const api = this.api;
  const url = `${api.getUser}access_token=${this.access_token}`;
  const options = {
    method: 'get',
    url
  };

  return axios(options).then((res) => res.data);
}

/**
 * 更新用户备注名
 * @param {String} openid 
 * @param {String} newName 
 */
Wechat.prototype.updateUserRemark = function(openid, newName) {
  const api = this.api;
  const url = `${api.updateUserRemark}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
    data: {
      "openid": openid,
      "remark": newName
    }
  };

  return axios(options).then((res) => res.data);
}

/**
 * 获取用户基本信息
 * @param {String} openid 
 */
Wechat.prototype.getUserInfo = function(openid) {
  const api = this.api;
  const url = api.getUserInfo.replace(/ACCESS_TOKEN/, this.access_token).replace(/OPENID/, openid);
  const options = {
    method: 'get',
    url
  };

  return axios(options).then((res) => res.data);
}

/**
 * 群发消息
 * @param {String} type 类型
 * @param {Object} msg 消息对象
 * @param {Number} tagId 标签ID
 */
Wechat.prototype.sendAllMsg = function(type, msg, tagId) {
  // https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
  const api = this.api;
  const url = `${api.sendAllMsg}access_token=${this.access_token}`;
  const data = {
    filter: {
      is_to_all: true
    },
    msgtype: 'text',
  };
  const options = {
    method: 'post',
    url,
    data,
  };

  if (tagId) {
    data.filter.is_to_all = false;
    data.filter.tag_id = tagId;
  }

  // 图文消息
  if (type === 'mpnews') {
    data.msgtype = 'mpnews';
    data.mpnews = {
      media_id: msg.media_id
    };
  }
  // 文本
  if (type === 'text') {
    data.text = {
      content: msg.Content
    };
  }
  // 语音/音频
  if (type === 'voice') {
    data.msgtype = 'voice';
    data.voice = {
      media_id: msg.media_id
    };
  }
  // 图片
  if (type === 'image') {
    data.msgtype = 'image';
    data.image = {
      media_id: msg.media_id
    };
  }
  // 视频(需要特殊处理)
  if (type === 'video') {
    data.msgtype = 'video';
    data.video = {
      media_id: msg.media_id
    };
  }
  // 卡券
  if (type === 'wxcard') {
    data.msgtype = 'wxcard';
    data.wxcard = {
      card_id: msg.card_id
    };
  }
  
  console.log(JSON.stringify(options));
  return axios(options).then((res) => res.data);
}

/**
 * 删除菜单
 */
Wechat.prototype.delMenu = function() {
  const api = this.api;
  const url = `${api.delMenu}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
  }

  return axios(options).then((res) => res.data);
}

/**
 * 创建菜单
 * @param {Object} menu 
 */
Wechat.prototype.createMenu = function(menu) {
  const api = this.api;
  const url = `${api.createMenu}access_token=${this.access_token}`;
  const options = {
    method: 'POST',
    url,
    data: menu
  }

  return axios(options).then((res) => res.data);
}

/**
 * 创建二维码
 * @param {Object} json 
 */
Wechat.prototype.createQRCode = function(json) {
  const api = this.api;
  const url = `${api.createQRCode}access_token=${this.access_token}`;
  const options = {
    method: 'POST',
    url,
    data: json
  }

  return axios(options).then((res) => res.data);
}

/**
 * 获取二维码图片
 * @param {String} ticket 
 */
Wechat.prototype.getQRCode = function(ticket) {
  const api = this.api;
  const url = `${api.getQRCode}ticket=${encodeURI(ticket)}`;
  const options = {
    method: 'get',
    url,
    responseType: 'arraybuffer'
  }

  return axios(options).then((res) => res.data);
}

/**
 * 智能接口调用
 */
Wechat.prototype.smartSearch = function(json) {
  const api = this.api;
  const url = `${api.smartSearch}access_token=${this.access_token}`;
  const options = {
    method: 'post',
    url,
    data: json
  }

  return axios(options).then((res) => res.data);
}

module.exports = Wechat;