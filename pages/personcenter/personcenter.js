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
  startEditNickname() {
    if (!this.data.islogin) {
      wx.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    // 自动填充当前昵称作为默认值
    this.setData({
      isEditingNickname: true,
      editNickname: this.data.userInfo.nickname
    });
  },

  // 监听昵称输入
  onNicknameInput(e) {
    this.setData({ editNickname: e.detail.value });
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
      success:async(res) => {
        const path = res.tempFiles[0].tempFilePath;
        const avatarUrl = await this.uploadavatartoServer(path,app.globalData.userId)
        // 保存到本地
        wx.setStorageSync('localAvatar', avatarUrl);
        console.log(avatarUrl)
        // 更新页面显示
        this.setData({
          avatar: avatarUrl,
          userInfo: {
            ...this.data.userInfo,
            avatar: avatarUrl
          }
        });
        console.log(avatarUrl)
        app.globalData.avaURL=avatarUrl;
        wx.showToast({ title: "更换头像成功" });
      }
    });
  },

  // 输入框
  inputUsername(e) { this.setData({ username: e.detail.value }); },
  inputPassword(e) { this.setData({ password: e.detail.value }); },

// 注册
async register() {
  const { username, password} = this.data;
  if (!username || !password ) {
    wx.showToast({ title: "请填写完整" });
    return;
  }
  const uuid = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
try{

  wx.request({
  url: "http://1.14.191.54:8888/api/register/",
  method: "POST",
  data: { 
    username: username, 
    password: password, 
    wechat_user_id: uuid,  
    openid: uuid ,
    nickname:username

  },
  header: { "Content-Type": "application/x-www-form-urlencoded" },
  success: (res) => {
    wx.showToast({
      title: res.data.msg,
      icon: "success"// 明确指定显示时间
    });
  

    console.log(res.data); // 看返回结果
    
    setTimeout(() => {
      this.login(); // 只调用一次登录
    }, 3000);
  
    
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
    
          const userInfo = {
            ...res.data.data,
          };
          // ✅ 核心：登录成功后，保存所有用户信息到本地存储
          // 永久保存，关闭小程序再打开依然存在
          wx.setStorageSync('cache_username', username); // 账号
          wx.setStorageSync('cache_password', password); // 密码（用于自动登录）
          wx.setStorageSync('cache_nickname', userInfo.nickname); // 昵称
          wx.setStorageSync('cache_userId', userInfo.wechat_user_id); // 用户ID
          wx.setStorageSync('cache_openid', userInfo.openid); // openid

          // 保存全局状态
          app.globalData.isLogin = true;
          app.globalData.userInfo = userInfo;
          app.globalData.userId = userInfo.wechat_user_id;
          app.globalData.openid = userInfo.openid;
          this.setData({
            islogin: true,
            userInfo: userInfo,
            userId: res.data.data.wechat_user_id,
            openid: res.data.data.openid
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
      avatar: "/images/1.png"
  });
    wx.showToast({ title: "退出登录",icon: "none"  });
  }


});