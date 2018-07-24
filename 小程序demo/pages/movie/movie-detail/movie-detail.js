// pages/movie/movie-detail/movie-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.request({
      url: `https://mini.kokota.cn/v2/movie/subject/${options.id}`,
      header: {
        'Content-Type': 'json'
      },
      success(res) {
        const data = res.data;
        console.log(data);
        data.tags = data.genres.join(' / ');
        data.countries = data.countries.join(' / ');
        that.setData({
          movieData: data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})