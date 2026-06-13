const app = getApp();
const dataManager = require('../../utils/data.js');

Page({
  data: {
    postList: [],
    page:1,
    pageSize:30,
    hasMore:true,
    loading:false,
    searchKey:"",
    isSearch:false,
    filteredList:[]
  },

  onLoad() {
    this.resetAndLoad() // 修复拼写：reset（重置）
  },

  onShow() {
    this.resetAndLoad()
  },

  // 下滑触底加载
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading||this.data.isSearch) return;
    this.getPostlist();
  },

  // 重置数据 + 刷新
  resetAndLoad() {
    this.setData({
      postList:[],
      page:1,
      hasMore:true,
      loading:false,
      searchKey: "",
      isSearch: false,
      filteredList: []
    });
    this.getPostlist();
  },
  onSearchInput(e)
  {
    const keyword =e.detail.value.trim();
    this.setData({ searchKey: keyword });
    if (!keyword) {
      this.resetAndLoad();
      return;
    }else{
      this.searchPosts(keyword);
    }


  },
  onSearch(){
    this.searchPosts(this.data.searchKey);

  },
  clearSearch()
  {
    this.setData({
      searchKey: "",
      isSearch: false,
      filteredList: []
    });
    this.getPostlist();
  },
  searchPosts(keyword)
  {
    if (!keyword) {
      this.clearSearch();
      return;
    }

    this.setData({
      isSearch: true,
      postList: [], // 清空旧结果
      page: 1,
      hasMore: true,
      loading: true
    });

    // 调用后端搜索接口
    wx.request({
      url: "http://1.14.191.54:8888/api/post/list/",
      method: "POST",
      header: { "Content-Type": "application/json" },
      data: {
        page: 1,
        page_size: this.data.pageSize,
        keyword: keyword // 传给后端关键词
      },
      success: (res) => {
        if (res.data.code === 0) {
          const { list, has_more } = res.data.data;
          this.setData({
            postList: list,
            hasMore: has_more,
            page: 2, // 搜索结果的下一页从2开始
            loading: false
          });

          if (list.length === 0) {
            wx.showToast({ title: "暂无搜索结果", icon: "none" });
          }
        }
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: "搜索失败", icon: "none" });
      }
    });
  },
  // 核心请求函数
  getPostlist() {
    const { page, pageSize, loading} = this.data;
    if (!this.data.hasMore || loading) return;
    this.setData({loading:true});

    wx.request({
      url:"http://1.14.191.54:8888/api/post/list/",
      method:"POST",
      header: { "Content-Type": "application/json" },
      data:{ page, page_size:pageSize, keyword:"" },
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
  getcomplice() { wx.showToast({ title: '服务商列表', icon: 'none' });
  wx.navigateTo({ url: '/pages/supply/supply' });
},
  getcard() { wx.showToast({ title: '资质办理', icon: 'none' }); },
  flowcomponic() { wx.showToast({ title: '公司转让', icon: 'none' }); },
  recoedatax() { wx.showToast({ title: '记账报税', icon: 'none' }); },
  finance() { wx.showToast({ title: '企业助贷', icon: 'none' }); },
  interation() { wx.showToast({ title: '跨境业务', icon: 'none' }); },
  hardbussice() { wx.showToast({ title: '疑难业务', icon: 'none' }); },
  Home() { 
    wx.showToast({ title: '主页', icon: 'none' }); 
    wx.navigateTo({ url: '/pages/index/index' });
},
  getorder() {},
  pushorder() { wx.navigateTo({url:'/pages/add/add'}); 
},
  personcenter() { wx.navigateTo({ url: '/pages/personcenter/personcenter' }); },
  goDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id='+id });
  }
});