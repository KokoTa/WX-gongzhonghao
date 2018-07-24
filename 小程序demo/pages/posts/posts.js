Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperData: [],
    postsData: [],
    btnText: '点击测试',
    start: 0, // 请求偏移量
    flag: true // 防止重复请求
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // 请求壁纸
    wx.request({
      url: 'https://api.lylares.com/images/?cid=26&start=2&count=5&AppKey=fJE0x3Sc90',
      header: {
        "Content-Type": "json"
      },
      success(res) {
        // that.data.swiperData = res.data.data; // 只有在同步且在onload下，执行此语句才成功，其他情况都用setData
        that.setData({
          swiperData: res.data.data
        })
      }
    })

    this.getBooks();
  },

  getBooks(start = 0, count = 40) { // 请求图文享信息
    const that = this;
    wx.request({
      url: `https://mini.kokota.cn/v2/book/search?tag=动漫&count=${count}&start=${start}`,
      header: {
        "Content-type": "json"
      },
      success(res) {
        console.log(res);
        
        that.setData({
          flag: true
        })
        
        const arr = res.data.books.map((item) => {
          item.pubdate = item.pubdate ?
            (item.pubdate.split('-').length > 1 ? item.pubdate.split('-')[0] + '年' : item.pubdate) :
            '暂无';
          return item;
        });

        const newArr = that.data.postsData.concat(arr);

        that.setData({
          postsData: newArr
        })
        that.setData({
          start: that.data.postsData.length
        })
      }
    })
  },

  jumpToPost(item) { // 跳转到详情页
    const id = item.currentTarget.dataset.item.id;
    wx.navigateTo({
      url: `./post-detail/post-detail?id=${id}`,
    });
  },

  toLower(e) { // 下拉加载数据
    console.log(e);
    if (this.data.flag) { // 防止重复触发
      console.log('request...');
      this.getBooks(this.data.start);
      this.setData({
        flag: false
      })
    }
  }
})