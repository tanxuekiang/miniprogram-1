const app = getApp();

Page({
  data: {
    post: {} // 存储帖子详情
  },

  // 页面加载：获取帖子id → 请求详情
  onLoad(options) {
    // 🔥 核心知识点：获取列表页传过来的 帖子id
    const postId = options.id;
    if (postId) {
      this.getPostDetail(postId);
    }
  },

  // 🔥 请求后端：获取单条帖子详情
  getPostDetail(id) {
    wx.request({
      url: "http://1.14.191.54:8888/api/post/detail/",
      method: "POST",
      data: { id: id },
      header: { "Content-Type": "application/json" },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            post: res.data.data // 赋值给页面，自动渲染
          });
        } else {
          wx.showToast({ title: "帖子不存在", icon: "none" });
        }
      },
      fail: () => {
        wx.showToast({ title: "网络异常", icon: "none" });
      }
    });
  }
});