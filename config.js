/**
 * 配置文件
 */
const path = require('path');
const util = require('./libs/util');
const accessTokenFile = path.join(__dirname, './wechat/accessTokenFile.txt');
const prefix = 'https://api.weixin.qq.com/cgi-bin';

const config = {
  wechat: { // 对应公众平台上的参数
    appID: 'wx475c09b524a46560',
    appSecret: 'e92d22149d5a3ef19b8f6102b642737e',
    token: 'KokoTa',
    getAccessToken() {
      return util.readFileAsync(accessTokenFile);
    },
    saveAccessToken(data) {
      data = JSON.stringify(data);
      return util.writeFileAsync(accessTokenFile, data);
    }
  },
  api: {
    accessTokenUrl: `${prefix}/token?grant_type=client_credential`,
    uploadTempleUrl: `${prefix}/media/upload?`
  }
};

module.exports = config;