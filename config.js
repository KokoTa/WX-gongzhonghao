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
    // 素材API
    accessTokenUrl: `${prefix}/token?grant_type=client_credential`, // access_token
    uploadTempleUrl: `${prefix}/media/upload?`, // 上传临时素材
    uploadPermanentUrl: `${prefix}/material/add_material?`, // 上传永久素材
    uploadNews: `${prefix}/material/add_news?`, // 上传永久图文
    uploadNewsImage: `${prefix}/media/uploadimg?`, // 上传永久图文的图片
    getTempleUrl: `${prefix}/media/get?`, // 获取临时素材
    getPermanentUrl: `${prefix}/material/get_material?`, // 获取永久素材
    getMaterialList: `${prefix}/material/batchget_material?`, // 获取永久素材列表
    delMaterial: `${prefix}/material/del_material?`, // 删除永久素材
    // 用户标签管理API
    createTag: `${prefix}/tags/create?`, // 增加分组
    getTag: `${prefix}/tags/get?`, // 获取
    updateTag: `${prefix}/tags/update?`, // 修改
    deleteTag: `${prefix}/tags/delete?`, // 删除
    getFunByTag: `${prefix}/user/tag/get?a`, // 获得某标签下的粉丝列表
    batchTag: `${prefix}/tags/members/batchtagging?`, // 批量为用户打标签
    batchunTag: `${prefix}/tags/members/batchuntagging?`, // 批量为用户取消标签
    getIdList: `${prefix}/tags/getidlist?`, // 获取用户身上的标签列表
    // 用户管理其他API
    getUser: `${prefix}/user/get?`, // 获取用户列表
    updateUserRemark: `${prefix}/user/info/updateremark?`, // 更改用户备注名(认证后可使用)
    getUserInfo: `${prefix}/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN`, // 获取某用户基本信息
    // 群发API
    sendAllMsg: `${prefix}/message/mass/sendall?`, // 按标签进行群发
    // 菜单API
    createMenu: `${prefix}/menu/create?`, // 创建菜单
    delMenu: `${prefix}/menu/delete?`, // 删除菜单
    getMenu: `${prefix}/menu/get?`, // 查询菜单
  }
};

module.exports = config;