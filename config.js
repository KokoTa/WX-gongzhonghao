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
    accessTokenUrl: `${prefix}/token?grant_type=client_credential`, // access_token
    uploadTempleUrl: `${prefix}/media/upload?`, // 上传临时素材
    uploadPermanentUrl: `${prefix}/material/add_material?`, // 上传永久素材
    uploadNews: `${prefix}/material/add_news?`, // 上传永久图文
    uploadNewsImage: `${prefix}/media/uploadimg?`, // 上传永久图文的图片
    getTempleUrl: `${prefix}/media/get?`, // 获取临时素材
    getPermanentUrl: `${prefix}/material/get_material?`, // 获取永久素材
    getMaterialList: `${prefix}/material/batchget_material?`, // 获取永久素材列表
    delMaterial: `${prefix}/material/del_material?`, // 删除永久素材
  }
};

module.exports = config;