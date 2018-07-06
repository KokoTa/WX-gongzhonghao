const fs = require('fs');

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

// 格式化 xml
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
          message[key] = formatXML(val);
        }
        // 如果不是对象，则赋值
        else {
          message[key] = (val || '').trim();
        }
      } else  {
        // 如果长度不为 1，即 > 1，则对数组进行遍历
        message[key] = [];
        
        for (let j = 0; j < item.length; j++) {
          message[key].push(formatXML(item[j]));
        }
      }
    }
  }

  return message;
}