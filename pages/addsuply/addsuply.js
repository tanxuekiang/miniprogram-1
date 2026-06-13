// 已删除无效的 require 行
const app = getApp();

Page({
  data: {
    companyName: "",
    contact: "",
    content: "",
    imageList: [],
    loading: false
  },

  onLoad() {},
  onShow() {},

  // 公司名称输入
  inputCompanyName(e) {
    this.setData({ companyName: e.detail.value?.trim() });
  },
  // 联系方式输入
  inputContact(e) {
    this.setData({ contact: e.detail.value?.trim() });
  },
  // 内容输入
  inputContent(e) {
    this.setData({ content: e.detail.value?.trim() });
  },

  // 选择图片
  chooseImages() {
    const maxCount = 9 - this.data.imageList.length;
    if (maxCount <= 0) {
      wx.showToast({ title: "最多上传9张图片", icon: "none" });
      return;
    }
    wx.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(item => item.tempFilePath);
        this.setData({
          imageList: [...this.data.imageList, ...tempFiles]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const newList = this.data.imageList.filter((_, i) => i !== index);
    this.setData({ imageList: newList });
  },

  

  // 提交发布
  async submitPost() {
    const { companyName, contact, content, imageList, loading } = this.data;
    if (loading) return;

    // 表单校验
    if (!companyName) {
      wx.showToast({ title: "请输入公司名称", icon: "none" });
      return;
    }
    if (!contact) {
      wx.showToast({ title: "请输入联系方式", icon: "none" });
      return;
    }
    if (!content) {
      wx.showToast({ title: "请输入介绍内容", icon: "none" });
      return;
    }
    if (imageList.length === 0) {
      wx.showToast({ title: "请上传至少1张图片", icon: "none" });
      return;
    }
    const userId = app.globalData.userId;
    if (!userId) {
      wx.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => wx.redirectTo({ url: "/pages/login/login" }), 1500);
      return;
    }

    this.setData({ loading: true });

    try {
      // 1. 循环上传所有图片，拿到线上URL数组
      const user_id = userId;
      // 批量构建上传任务
      const uploadTasks = imageList.map(path => {
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            url: "http://1.14.191.54:8888/api/upload/image/",
            filePath: path,
            name: "image",
            formData: {
              wechat_user_id: user_id
            },
            success: (res) => {
              const data = JSON.parse(res.data);
              if (data.code === 0) {
                resolve(data.image_url);
              } else {
                reject(new Error(data.msg || "图片上传失败"));
              }
            },
            fail: reject
          });
        });
      });

      // 等待全部图片上传完成，拿到不同URL数组
      const imgUrlList = await Promise.all(uploadTasks);
      console.log("图片URL列表：", imgUrlList);

 

        // 2. 提交表单 + 图片URL数组（json 格式提交）
        const res = await new Promise((resolve, reject) => {
          wx.request({
            url: "http://1.14.191.54:8888/api/supply/publish/",
            method: "POST",
            header: {
              "Content-Type": "application/json"  // ✅ 首字母大写，标准写法
            },
            data: {
              user_id: user_id,
              company_name: companyName,
              contact: contact,
              content: content,
              // 图片URL数组转字符串传给后端
              images: imgUrlList
            },
            success: resolve,
            fail: reject
          });
        });
  
        const result = res.data;
        if (result.code === 200) {
          wx.showToast({ title: "发布成功" });
          // 清空表单
          this.setData({
            companyName: "",
            contact: "",
            content: "",
            imageList: []
          });
          setTimeout(() => wx.navigateBack(), 1200);
        } else {
          throw new Error(result.msg || "发布失败");
        }
 
    

    } catch (err) {
      wx.showToast({ title: err.message || "请求失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  }
});