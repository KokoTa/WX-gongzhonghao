/**
 * 根据不同的消息类型定制回复内容
 * 注意不能在这个文件中 require('wechat)，这会导致循环引用，将得到 {}
 * 这就是 wechat 作为一个参数的原因
 */
const path = require('path');

let tempImage = '';
let tempVideo = '';

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
      };
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
      // 上传临时图文
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
    } 
    else if (content === '5') {
      // 上传临时图片
      const img = await wechat.uploadMaterial(path.join(__dirname, '../image/01.jpg'), 'image');
      reply.MsgType = 'image';
      reply.MediaId = img.media_id;
      tempImage = img.media_id;
    } 
    else if (content === '6') {
      // 上传临时视频
      // 如果网速卡，微信会发三次请求，当过了几秒后视频/音乐还没上传完，就判定失败
      const video = await wechat.uploadMaterial(path.join(__dirname, '../video/01.mp4'), 'video');
      reply.MsgType = 'video';
      reply.MediaId = video.media_id;
      reply.Title = '视频01';
      reply.Description = '这是一个测试视频';
      tempVideo = video.media_id;
    } 
    else if (content === '7') {
      // 上传临时音乐
      const img = await wechat.uploadMaterial(path.join(__dirname, '../image/01.jpg'), 'image');
      reply.MsgType = 'music';
      reply.Title = '音乐01';
      reply.Description = '这是一个测试音乐';
      reply.MusicURL = 'http://www.ytmp3.cn/?down/48732.mp3';
      reply.HQMusicUrl = 'http://www.ytmp3.cn/?down/48732.mp3';
      reply.ThumbMediaId = img.media_id;
    } 
    else if (content === '8') {
      // 上传永久图片
      const img = await wechat.uploadMaterial(path.join(__dirname, '../image/01.jpg'), 'image', true);
      if (img.media_id) {
        reply.MsgType = 'image';
        reply.MediaId = img.media_id;
      } else {
        reply.Content = '超过API调用次数 or 上传失败';
      }
    } 
    else if (content === '9') {
      // 上传永久视频
      const json = {
        "title": '永久视频',
        "introduction": '没有介绍'
      };
      const video = await wechat.uploadMaterial(path.join(__dirname, '../video/01.mp4'), 'video', true, { jsonString: JSON.stringify(json) });
      if (video.media_id) {
        reply.MsgType = 'video';
        reply.MediaId = video.media_id;
        reply.Title = '视频02';
        reply.Description = '这是一个测试视频';
      } else {
        reply.Content = '超过API调用次数 or 上传失败';
      }
        
    } 
    else if (content === '10') {
      // 上传永久图文：先上传永久图作为封面，再上传图文内容中的图，然后将拼装好的图文信息上传
      // 上传成功后通过返回的 media_id 再获取这个图文消息进行推送
      const permanentImg = await wechat.uploadMaterial(path.join(__dirname, '../image/01.jpg'), 'image', true);
      const newsImg = await wechat.uploadMaterial(path.join(__dirname, '../image/01.jpg'), 'image', true, { alias: 'news' });
      const articles = {
      "articles": [
          {
            "title": '图文消息',
            "thumb_media_id": permanentImg.media_id,
            "author": 'KokoTa',
            "digest": 'Nonono',
            "show_cover_pic": 1,
            "content": newsImg.url,
            "content_source_url": 'https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729'
          },
          //若新增的是多图文素材，则此处应还有几段articles结构
        ]
      };

      const result = await wechat.uploadMaterial('', 'news', true, { articles });
      if (result.media_id) {
        const news = wechat.getMaterial(result.media_id, 'news', true);
        const arr = [];
        reply.MsgType = 'news';
        news.news_item.forEach((item) => {
          arr.push({
            Title: item.title,
            Description: item.digest,
            PicUrl: permanentImg.media_id,
            Url: item.url
          });
        });
        reply.Articles = arr;
      } else {
        reply.Content = '超过API调用次数 or 上传失败';
      }
    } 
    else if (content === '11') {
      // 获取临时图片
      const img = await wechat.getMaterial(tempImage, 'image');
      await wechat.downloadMaterial(img);
      reply.Content = '图片已下载到服务器';
    } 
    else if (content === '12') {
      // 获取临时视频
      const video = await wechat.getMaterial(tempVideo, 'video');
      const json = JSON.parse(video);
      await wechat.downloadMaterial(json);
      reply.Content = '视频已下载到服务器';
    }
    else if (content === '13') {
      // 获取永久图片列表
      const list = await wechat.getMaterialList('image', 0, 20);
      if (list.total_count > 0) {
        reply.Content = `有${list.total_count}张永久图片`;
      } else {
        reply.Content = '超过API调用次数 or 木有永久图片';
      }
    }
    else if (content === '14') {
      // 删除永久图片素材
      const result = await wechat.delMaterail('bf9a1ppxa6BMztH2wHjXjl04j8rStGRiciVsI2bcmhw');
      if (result.errcode === 0) {
        reply.Content = '删除永久图片素材成功';
      } else {
        reply.Content = '删除永久图片素材失败';
      }
    }
    else if (content === '15') {
      // 创建用户标签
      const result = await wechat.createTag('福建');
      if (!result.errcode) {
        console.log('创建用户标签', result);
        reply.Content = result;
      } else {
        reply.Content = '标签已存在 or 创建失败';
      }
      // 获取用户标签
      const tagList = await wechat.getTag();
      if (!tagList.errcode) {
        console.log('获取用户标签', tagList);
        const tags = tagList.tags.map((item) => item.name);
        reply.Content = `目前的用户标签有：${tags}`; // 微信的换行是个谜
      } else {
        reply.Content = '获取用户标签失败';
      }

      // 修改用户标签略
      // 删除用户标签略
      
      // 获取用户列表
      const userList = await wechat.getUser();
      if (!userList.errcode) {
        console.log('获取用户列表', userList);
        const openid = userList.data.openid[0];
        // 为第一个用户打标签
        const batch = await wechat.batchTag(openid);
        if (!batch.errcode) {
          console.log('为第一个用户打标签', batch);
          reply.Content = '标记成功';
        } else {
          reply.Content = '标记失败';
        }
      } else {
        reply.Content = '获取用户失败';
      }
    }
    else if (content === '16') {
      // 更改用户名(微信认证后可使用)
      const result = await wechat.updateUserRemark(msg.FromUserName, 'KokoTa');
      if (!result.errcode) {
        console.log('更改用户名', result);
        reply.Content = '更改用户名成功';
      } else {
        reply.Content = '更改用户名失败';
      }
    }
    else if (content === '17') {
      // 获取某用户基本信息
      const info = await wechat.getUserInfo(msg.FromUserName);
      if (!info.errcode) {
        console.log('获取某用户基本信息', info);
        reply.Content = `您的居住地为：${info.country} - ${info.province} - ${info.city}`;
      } else {
        reply.Content = '获取用户基本信息失败';
      }
    }

    return reply;
  }
  // 当类型为位置
  else if (msg.MsgType === 'location') {
    return {
      MsgType: 'text',
      Content: `您所在的位置为：${msg.Label}`
    };
  }
}

module.exports = replyContent;