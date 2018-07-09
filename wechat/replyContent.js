/**
 * 根据不同的消息类型定制回复内容
 * 注意不能在这个文件中 require('wechat)，这会导致循环引用，将得到 {}
 * 这就是 wechat 作为一个参数的原因
 */
const path = require('path');

async function replyContent(msg, wechat) {
  // 当类型为事件
  if (msg.MsgType === 'event') {
    if (msg.Event === 'subscribe') {
      // 订阅
      return {
        MsgType: 'text',
        Content: `您关注了公众号，事件Key ${msg.EventKey} - 二维码的Ticket ${msg.Ticket}`,
      };
    } 
    else if (msg.Event === 'SCAN') {
      // 扫描
      return {
        MsgType: 'text',
        Content: `事件Key ${msg.EventKey} - 二维码的Ticket ${msg.Ticket}`
      }
    } 
    else if (msg.Event === 'unsubscribe') {
      // 取消订阅
      return {
        MsgType: 'text',
        Content: '您取消了关注/(ㄒoㄒ)/~~',
      };
    } 
    else if (msg.Event === 'LOCATION') {
      // 上报地理位置
      return {
        MsgType: 'text',
        Content: `您上报的地理位置为，经度 ${msg.Longitude}-纬度 ${msg.Latitude}-精度 ${msg.Precision}`
      };
    } 
    else if (msg.Event === 'CLICK') {
      // 点击菜单
      return {
        MsgType: 'text',
        Content: `您点击了菜单，事件Key ${msg.EventKey}`
      };
    } 
    else if (msg.Event === 'VIEW') {
      // 点击菜单跳转链接
      return {
        MsgType: 'text',
        Content: `您点击了菜单跳转链接，事件Key ${msg.EventKey}`
      };
    }
    
  }
  // 当类型为文本
  else if (msg.MsgType === 'text') {
    const content = msg.Content;
    let reply = {
      MsgType: 'text',
      Content: `您输入的 "${content}" 没有对应的回复`
    };

    if (content === '1') {
      reply.Content = '1. 哼~我才不会说输入2会有结果呢！';
    }
    else if (content === '2') {
      reply.Content = '2. 八嘎hentai无路赛！'
    }
    else if (content === '3') {
      reply.Content = '3. 你真的是个大笨蛋呢！'
    }
    else if (content === '4') {
      reply.MsgType = 'news';
      reply.Articles = [
        {
          Title: '我是图文信息，编号01',
          Description: '啦啦啦',
          PicUrl: 'http://img.mp.itc.cn/upload/20170304/de1b293c69da46c0b13b6db7fa4c897d_th.jpg',
          Url: 'https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543'
        },
        {
          Title: '我是图文信息，编号02',
          Description: '略略略',
          PicUrl: 'http://img.mp.itc.cn/upload/20170304/4c40a0728257448dbbf509850c91e61f_th.JPG',
          Url: 'https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543'
        }
      ];
      reply.ArticleCount = reply.Articles.length;
    } else if (content === '5') {
      const result = await wechat.uploadTemple(path.join(__dirname, '../image/01.jpg'), 'image');
      reply.MsgType = 'image';
      reply.MediaId = result.media_id;
    } else if (content === '6') {
      // 如果网速卡，微信会发三次请求，当过了几秒后视频/音乐还没上传完，就判定失败
      const result = await wechat.uploadTemple(path.join(__dirname, '../video/01.mp4'), 'video');
      reply.MsgType = 'video';
      reply.MediaId = result.media_id;
      reply.Title = '视频01';
      reply.Description = '这是一个测试视频';
    } else if (content === '7') {
      const img = await wechat.uploadTemple(path.join(__dirname, '../image/01.jpg'), 'image');
      // const music = await wechat.uploadTemple(path.join(__dirname, '../music/01.mp3'), 'music');
      reply.MsgType = 'music';
      reply.Title = '音乐01';
      reply.Description = '这是一个测试音乐';
      reply.MusicURL = 'http://www.ytmp3.cn/?down/48732.mp3';
      reply.HQMusicUrl = 'http://www.ytmp3.cn/?down/48732.mp3';
      reply.ThumbMediaId = img.media_id;
    }

    return reply;
  }
}

module.exports = replyContent;