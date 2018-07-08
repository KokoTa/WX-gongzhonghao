/**
 * 根据不同的消息类型定制回复内容
 */
function replyContent(msg) {
  if (msg.MsgType === 'event') {
    if (msg.Event === 'subscribe') {
      return {
        MsgType: 'text',
        Content: '感谢您关注KokoTa的公众号',
      };
    }
  }
  
  // 默认回复文本
  return {
    MsgType: 'text',
    Content: '没有对应的回复哟',
  };
}

module.exports = replyContent;