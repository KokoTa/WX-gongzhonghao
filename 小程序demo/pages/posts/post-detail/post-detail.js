// pages/posts/post-detail/post-detail.js
const app = getApp(); // 这里使用全局变量来存储音乐播放的状态和正在播放的音乐的id值，不能使用局部变量是因为每次进入 detail 页后都会初始化变量，so sad =_=，另外 app 的变量赋值不需要用 setData 方法

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookId: 0,
    postData: {},
    collectText: '收藏',
    playStatus: 'START'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.bookId = options.id;

    // 判断是否已收藏
    if (wx.getStorageSync(options.id)) {
      this.setData({
        collectText: '已收藏'
      })
    } else {
      this.setData({
        collectText: '收藏'
      })
    }
    
    // 获取数据
    const that = this;
    wx.request({
      url: `https://mini.kokota.cn/v2/book/${options.id}`,
      header: {
        "Content-Type": "json"
      },
      success(res) {
        const data = res.data;
        data.tags = data.tags.map(item => item.name).join(' ');
        that.setData({
          postData: data
        })
      }
    });

    // 初始化时，判断播放状态
    if (app.globalData.isPlaying && app.globalData.playId === options.id) {
      this.setData({
        playStatus: 'STOP'
      })
    } else {
      this.setData({
        playStatus: 'START'
      })
    }

    // 监听音乐播放事件
    wx.onBackgroundAudioPlay(() => {
      this.setData({
        playStatus: 'STOP'
      })
      app.globalData.playId = options.id;
    });
    wx.onBackgroundAudioPause(() => {
      this.setData({
        playStatus: 'START'
      })
      app.globalData.playId = null;
    });
  },

  /**
   * 收藏操作
   */
  collectBook() {
    const id = this.data.bookId;
    const item = this.data.postData;
    const result = wx.getStorageSync(id);
    if (result) {
      wx.removeStorageSync(id);
      this.setData({
        collectText: '收藏'
      })
    } else {
      wx.setStorageSync(id, item);
      this.setData({
        collectText: '已收藏'
      })
    }

    wx.showToast({
      title: this.data.collectText === '收藏' ? '取消成功' : '收藏成功',
      duration: 2000
    })
  },

  /**
   * 设置分享，未发布的小程序无法检测分享功能
   * http://www.wxappclub.com/topic/1264
   */
  onShareAppMessage(res) {
    console.log(res);
    return {
      title: this.data.postData.title,
      path: `./post-detail?id=${this.data.bookId}`,
      success(res) {
        console.log(res);
      }
    }
  },

  /**
   * 音乐播放
   */
  audioPlay() {
    if (!app.globalData.isPlaying) {
      wx.playBackgroundAudio({
        dataUrl: 'http://96.f.1ting.com/5b567d25/9cc98d67c4e0150fb589d1802b47b24e/zzzzzmp3/2015fJun/05F/05xzqss/02.mp3',
        title: '演员-薛之谦',
        coverImgUrl: this.data.postData.images.large
      });
    } else {
      wx.pauseBackgroundAudio();
    }

    app.globalData.isPlaying = !app.globalData.isPlaying;
  }
})