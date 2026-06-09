// pages/add/add.js
const dataManager = require("../../utils/data.js");
const app = getApp();

Page({
  data: {
    title: "",
    content: "",
    userInfo:{},
    userId:"",
    postTypes: ["资质办理", "公司转让", "记账报税", "企业助贷", "跨境业务", "其它业务"],
    selectedType: "" // 选中的类型
  },
onLoad()
{
  this.setData({
    userInfo:app.globalData.userInfo,
    userId:app.globalData.userId
  });
},
  // 输入标题
  inputTitle(e) {
    this.setData({ title: e.detail.value?.trim() });
  },

  // 输入内容
  inputContent(e) {
    this.setData({ content: e.detail.value?.trim() });
  },
  // 🔥 新增：选择帖子类型（下拉选择器事件）
  bindTypeChange(e) {
    const index = e.detail.value;
    const selectedType = this.data.postTypes[index];
    this.setData({
      selectedType: selectedType
    });
  },

  // 提交发布
  submitPost() {
    const { title, content,userInfo,userId,selectedType } = this.data;

    // 校验输入
    if (!title) {
      wx.showToast({ title: "请输入帖子标题", icon: "none" });
      return;
    }
    if (!content) {
      wx.showToast({ title: "请输入帖子内容", icon: "none" });
      return;
    }
    if (!selectedType) {
      wx.showToast({ title: "请选择帖子类型", icon: "none" });
      return;
    }
    wx.request({
      url:"http://1.14.191.54:8888/api/add/post/",
      method:"POST",
      data:{
        title:title,
        content: content,
        userId: userId,
        tietype:selectedType
      },
      header: {
        "Content-Type": "application/json"
      },
    success:(res)=>{
      if(res.data.code===0)
      {
        console.log("后端返回结果：", res.data);

        wx.showToast({
          title: '发布成功',
          icon: "success"
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }else{
        
        wx.showToast({
          
          title: res.data.msg || "发布失败",
          icon: "none"
        });

      }

    },
    fail:(res)=>{
      wx.showToast({title: "网络错误，发布失败", icon: "none"})
    }


    });

   


},
});