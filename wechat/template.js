/**
 * 微信消息类型模板文件
 */
function checkType(info) {
  let str = '';
  switch (info.MsgType) {
    case 'text':
      str = `
        <Content><![CDATA[${info.Content}]]></Content>
      `;
      break;
    case 'image':
      str = `
        <Image>
          <MediaId><![CDATA[${info.MediaId}]]></MediaId>
        </Image>
      `;
      break;
    case 'voice':
      str = `
        <Voice>
          <MediaId><![CDATA[${info.MediaId}]]></MediaId>
        </Voice>
      `;
      break;
    case 'video':
      str = `
        <Video>
          <MediaId><![CDATA[${info.MediaId}]]></MediaId>
          <Title><![CDATA[${info.Title}]]></Title>
          <Description><![CDATA[${info.Description}]]></Description>
        </Video>
      `;
      break;
    case 'music':
      str = `
        <Music>
          <Title><![CDATA[${info.Title}]]></Title>
          <Description><![CDATA[${info.Description}]]></Description>
          <MusicUrl><![CDATA[${info.MusicURL}]]></MusicUrl>
          <HQMusicUrl><![CDATA[${info.HQMusicUrl}]]></HQMusicUrl>
          <ThumbMediaId><![CDATA[${info.ThumbMediaId}]]></ThumbMediaId>
        </Music>
      `;
      break;
    case 'news':
      str = `
        <ArticleCount>${info.ArticleCount}</ArticleCount>
        <Articles>
          ${newsHandle(info.Articles)}
        </Articles>
      `;
      break;
    default:
      break;
  }

  return str;
}

function newsHandle(articles) {
  let str = '';

  articles.forEach((item) => {
    str += `
      <item>
        <Title>< ![CDATA[${item.Title}] ]></Title>
        <Description>< ![CDATA[${item.Description}] ]></Description>
        <PicUrl>< ![CDATA[${item.PicUrl}] ]></PicUrl>
        <Url>< ![CDATA[${item.Url}] ]></Url>
      </item>
    `
  });

  return str;
}


function createTemplate(info) {
  return `
    <xml>
      <ToUserName><![CDATA[${info.FromUserName}]]></ToUserName>
      <FromUserName><![CDATA[${info.ToUserName}]]></FromUserName>
      <CreateTime>${info.CreateTime}</CreateTime>
      <MsgType><![CDATA[${info.MsgType}]]></MsgType>
      ${checkType(info)}
    </xml>
  `.replace(/\s/g, '');
}

module.exports = createTemplate;