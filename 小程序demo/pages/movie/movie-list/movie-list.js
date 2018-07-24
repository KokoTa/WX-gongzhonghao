// pages/movie/movie-list/movie-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    movies: [],
    flag: true,
    start: 0,
    requestType: 0, // 0 top250的搜索；1 输入字段的搜索
    requestName: '',
  },


  ready() {
    const that = this;
    this.getMovies();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getMovies(start = 0, count = 20) { // 获取电影
      const that = this;
      wx.request({
        url: this.data.requestType ? 
          `https://mini.kokota.cn/v2/movie/search?q=${this.data.requestName}&start=${start}&count=${count}`: 
          `https://mini.kokota.cn/v2/movie/top250?start=${start}&count=${count}`,
        header: {
          'Content-Type': 'json'
        },
        success(res) {
          console.log(res);
          const arr = that.data.movies;
          const newArr = arr.concat(res.data.subjects);
          that.setData({
            movies: newArr,
            flag: true
          })
          that.setData({
            start: that.data.movies.length,
          })
        }
      })
    },
    toLower(e) { // 下拉加载
      if (this.data.flag) {
        this.getMovies(this.data.start);
        this.setData({
          flag: false
        })
      }
    },
    goMovieDetail(e) { // 跳转详情
      wx.navigateTo({
        url: `movie-detail/movie-detail?id=${e.currentTarget.dataset.id}`
      })
    },
    searchMovie(name) { // 搜索电影
      this.setData({
        movies: [],
        start: 0,
        requestType: 1,
        requestName: name
      })

      if (!name) { // 没有搜索字段就改为请求 top250
        this.setData({
          requestType: 0
        })
        this.getMovies();
      } else {
        this.getMovies(0, 20);
      }
    }
  }
})
