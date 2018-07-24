// pages/movie/movie.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 实时获取输入值，回车搜索电影
   */
  searchMovie(e) {
    const value = e.detail.value;
    this.setData({
      searchText: value
    })
    this.selectComponent("#movie-list").searchMovie(this.data.searchText);
  }
})