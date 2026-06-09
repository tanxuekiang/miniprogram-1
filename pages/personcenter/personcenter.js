const app = getApp();

Page({
  data: {
    userInfo: {},
    userId: "",
    openid: "",
    username: "",
    password: "",
    nickname: "",
    avatar: "", // 本地头像
    islogin: false
  },

  onLoad() {
    this.loadLoginStatus();
    this.loadLocalAvatar(); // 进入页面 → 加载本地头像
    this.autologin()
  },

  onShow() {
    this.loadLoginStatus();
    this.loadLocalAvatar();
    this.autologin()
  },

  // 加载登录状态
  loadLoginStatus() {
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        islogin: true,
        userInfo: app.globalData.userInfo,
        userId: app.globalData.userId,
        openid: app.globalData.openid,
        nickname: app.globalData.userInfo.nickname
      });
    } else {
      this.setData({ islogin: false });
    }
  },

  // -------------- 【核心】加载本地保存的头像 --------------
  loadLocalAvatar() {
    const localAvatar = wx.getStorageSync('localAvatar');
    // 如果本地有保存 → 用保存的；没有 → 默认头像
    const avatar = localAvatar ? localAvatar : "/images/default-avatar.png";

    this.setData({ avatar });

    // 如果已登录，同步更新到 userInfo
    if (this.data.islogin) {
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          avatar: avatar
        }
      });
    }
  },

  // -------------- 【核心】更换本地头像 --------------
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath;

        // 保存到本地
        wx.setStorageSync('localAvatar', path);

        // 更新页面显示
        this.setData({
          avatar: path,
          userInfo: {
            ...this.data.userInfo,
            avatar: path
          }
        });

        wx.showToast({ title: "更换头像成功" });
      }
    });
  },

  // 输入框
  inputNickname(e) { this.setData({ nickname: e.detail.value }); },
  inputUsername(e) { this.setData({ username: e.detail.value }); },
  inputPassword(e) { this.setData({ password: e.detail.value }); },
  uploadavatartoServer(avatar,uuid){
    return new Promise((resolve,reject)=>{
      wx.uploadFile({
        url: "http://1.14.191.54:8888/api/upload/avatar/",
       filePath:avatar,
       name:"avatar",
       formData: { wechat_user_id: uuid },
       success:(uploadRes)=>{
         try {
          const data =JSON.parse(uploadRes.data)
          if(data.code===0&&data.avatar_url)
          resolve(data.avatar_url)
          else{
            wx.showToast({ title: "头像上传失败", icon: "none" })
            reject()
          }
                 } catch (error) {
                  wx.showToast({ title: "服务器解析错误", icon: "none" })
                  reject()
         }
       },
       fail:()=>{
        wx.showToast({ title: "头像上传失败", icon: "none" })
        reject()
               }


      })
    })
},
// 注册
async register() {
  const { username, password, nickname,avatar } = this.data;
  if (!username || !password ) {
    wx.showToast({ title: "请填写完整" });
    return;
  }
  const uuid = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  let serverAvatar;
try{
  if (avatar === "/images/default-avatar.png") {
    serverAvatar = "/images/default-avatar.png";
  } else {
    serverAvatar = await this.uploadavatartoServer(avatar, uuid);
  }

  wx.request({
  url: "http://1.14.191.54:8888/api/register/",
  method: "POST",
  data: { 
    username: username, 
    password: password, 
    nickname: nickname,
    wechat_user_id: uuid,  
    openid: uuid,
    avatar: serverAvatar       
  },
  header: { "Content-Type": "application/x-www-form-urlencoded" },
  success: (res) => {
    wx.showToast({ title: res.data.msg });
    console.log(res.data); // 看返回结果
  },  
  fail: () => {
    wx.showToast({ title: res.data.msg });
    console.log(res.data); // 看返回结果
  }
});}catch(error)
{
  console.log("注册失败头像上传失败");
}

},

  // 登录
  login() {
    const { username, password } = this.data;
    try{
    wx.request({
      url: "http://1.14.191.54:8888/api/login/",
      method: "POST",
      data: { username, password },
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: (res) => {
        if (res.data.code === 0) {
          // 读取本地保存的头像
          const localAvatar = wx.getStorageSync('localAvatar') || "/images/default-avatar.png";

          const userInfo = {
            ...res.data.data,
            nickname: res.data.data.nickname, 
            avatar: localAvatar // 头像来自本地
          };

          // 保存全局
          app.globalData.isLogin = true;
          app.globalData.userInfo = userInfo;
          app.globalData.userId = res.data.data.wechat_user_id;
          app.globalData.openid = res.data.data.openid;
          wx.setStorageSync('cache_username', username);
          wx.setStorageSync('cache_password', password);
          this.setData({
            islogin: true,
            userInfo: userInfo,
            userId: res.data.data.wechat_user_id,
            openid: res.data.data.openid,
            nickname: res.data.data.nickname
          });

          wx.showToast({ title: "登录成功" });
        }
      },
      fail: (res) => {
        wx.showToast({ title: res.data.msg });
        console.log(res.data); // 看返回结果
      }
    });
  }catch(error){
      console.log("登录失败");
    }
  },
  autologin() {
    const cacheusername=wx.getStorageSync('cache_username');
    const cachepassword=wx.getStorageSync('cache_password');
    if(this.data.islogin&&cacheusername&&cachepassword) return;
 
     
    this.setData({username: cacheusername, password: cachepassword});
    this.login();
  },
  relogin(){
    app.globalData.isLogin = false;
    app.globalData.userInfo={};
    app.globalData.userId="";
    wx.clearStorageSync();
    this.setData({
      islogin: false,
      userInfo: {},
      userId: "",
      openid: "",
      username: "",
      password: "",
      nickname: "",
      // 重置为默认头像
      avatar: "/images/default-avatar.png"
  });
    wx.showToast({ title: "退出登录",icon: "none"  });
  }


});