const fs = require('fs');
const replyContent = require('../wechat/replyContent');
const createTemplate = require('../wechat/template');

// 本地读取
exports.readFileAsync = (path, encoding = 'utf-8') => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    });
  });
};

// 本地写入
exports.writeFileAsync = (path, content = {}) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) reject(err)
      else resolve()
    });
  });
};

// 格式化 xml 为标准 json
exports.formatXML = (xml) => {
  const message = {};

  if (typeof xml === 'object') {
    const keys = Object.keys(xml);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = xml[key];

      // 如果不是数组或者数组长度为 0，则为非规范数据，跳过
      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }

      // 如果是数组且长度为 1
      if (item.length === 1) {
        const val = item[0];

        // 如果是对象，那么就递归
        if (typeof val === 'object') {
          // console.log('this', this);
          message[key] = this.formatXML(val);
        }
        // 如果不是对象，则赋值
        else {
          message[key] = (val || '').trim();
        }
      } else  {
        // 如果长度不为 1，即 > 1，则对数组进行遍历
        message[key] = [];
        
        for (let j = 0; j < item.length; j++) {
          message[key].push(this.formatXML(item[j]));
        }
      }
    }
  }

  return message;
}

// 格式化回复信息
exports.formatReplyInfo = async (msg, wechat) => {
  const reply = await replyContent(msg, wechat); // 根据消息类型来决定回复内容

  if (reply) {
    const info = {
      ToUserName: msg.ToUserName,
      FromUserName: msg.FromUserName,
      CreateTime: new Date().getTime(),
      ...reply,
    };

    const xml = createTemplate(info); // 转为 xml
    
    return xml;
  } else {
    return false;
  }
}