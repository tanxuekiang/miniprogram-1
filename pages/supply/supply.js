const app = getApp();

Page({
  data: {
    displayList: [],
    searchText: "",
    page: 1,
    pageSize: 8,
    hasMore: true,
    loading: false
  },

  onShow() {
    // 关键：从发布页返回当前页，自动刷新数据
    this.resetAndLoad();
  },

  onPullDownRefresh() {
    this.resetAndLoad();
    wx.stopPullDownRefresh();
  },

  inputSearch(e) {
    this.setData({
      searchText: e.detail.value.trim()
    });
  },

  doSearch() {
    this.resetAndLoad();
  },

  resetAndLoad() {
    this.setData({
      displayList: [],
      page: 1,
      hasMore: true,
      loading: false
    });
    this.loadMoreData();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadMoreData();
  },

  loadMoreData() {
    const { page, pageSize, searchText, displayList } = this.data;
    this.setData({ loading: true });

    wx.request({
      url: "http://1.14.191.54:8888/api/supply/list/",
      method: "POST",
      data: {
        page: page,
        pageSize: pageSize,
        keyword: searchText
      },
      success: (res) => {
        if (res.data.code == 200) {
          const { list, hasMore } = res.data.data;
          const newList = page === 1 ? list : [...displayList, ...list];
          this.setData({
            displayList: newList,
            page: page + 1,
            hasMore: hasMore
          });
        } else {
          wx.showToast({ title: res.data.msg, icon: "none" });
        }
      },
      fail: () => {
        wx.showToast({ title: "网络请求失败", icon: "none" });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  goToDetail(e) {

  },

  goToCreatePost() {
    wx.navigateTo({
      url: '/pages/addsuply/addsuply'
    });
  },

  // 补充底部导航缺失方法，防止点击报错
  Home() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },
  person() {
    wx.redirectTo({
      url: '/pages/personcenter/personcenter'
    })
  }
});