const app = getApp();
const dataManager = require('../../utils/data.js');

Page({
  data: {
    postList: [],
    page:1,
    pageSize:30,
    hasMore:true,
    loading:false
  },

  onLoad() {
    this.resetAndLoad() // 修复拼写：reset（重置）
  },

  onShow() {
    this.resetAndLoad()
  },

  // 下滑触底加载
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.getPostlist();
  },

  // 重置数据 + 刷新
  resetAndLoad() {
    this.setData({
      postList:[],
      page:1,
      hasMore:true,
      loading:false
    });
    this.getPostlist();
  },

  // 核心请求函数
  getPostlist() {
    const { page, pageSize, loading} = this.data;
    if (!this.data.hasMore || loading) return;
    this.setData({loading:true});

    wx.request({
      url:"http://1.14.191.54:8888/api/post/list/",
      method:"POST",
      data:{ page, page_size:pageSize },
      header: { "Content-Type": "application/json" },
      timeout: 5000,
      success:(res)=>{
        console.log("后端返回的数据：", res.data);

        if(res.data.code===0)
        {
          const { list, has_more } = res.data.data;
          const newList = page === 1 ? list: [...this.data.postList, ...list];
          
          this.setData({
            postList: newList,
            hasMore: has_more,
            page: page + 1,
            loading: false
          });

          // ✅ 修复：把判断移到 if 内部！访问正常，无报错
          if(newList.length===0)
          {
            wx.showToast({ title: "暂无帖子", icon:"none" });
          }
        }
      },
      fail:(res)=>{
        this.setData({loading:false});
        wx.showToast({ title: "网络异常", icon: "none" });
      }
    });
  },

  // 以下是你的原有业务代码，无修改
  getcomplice() { wx.showToast({ title: '服务商列表', icon: 'none' }); },
  getcard() { wx.showToast({ title: '资质办理', icon: 'none' }); },
  flowcomponic() { wx.showToast({ title: '公司转让', icon: 'none' }); },
  recoedatax() { wx.showToast({ title: '记账报税', icon: 'none' }); },
  finance() { wx.showToast({ title: '企业助贷', icon: 'none' }); },
  interation() { wx.showToast({ title: '跨境业务', icon: 'none' }); },
  hardbussice() { wx.showToast({ title: '疑难业务', icon: 'none' }); },
  Home() { wx.showToast({ title: '主页', icon: 'none' }); },
  getorder() {},
  pushorder() { wx.navigateTo({url:'/pages/add/add'}); 
},
  personcenter() { wx.navigateTo({ url: '/pages/personcenter/personcenter' }); },
  goDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id='+id });
  }
});