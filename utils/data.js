const util = require('./util.js');

// 全局帖子数据（初始化+本地缓存读取）
let posts = wx.getStorageSync('forumPosts') || [
  {
    id: 1,
    title: "第一个帖子",
    content: "Hello World！这是我的小程序论坛~",
    createTime: util.formatTime(new Date('2025-05-21 10:00')),
    userAvatar: '/images/default-avatar.png',
    userNickname: '系统默认',
    userAccount: 'system_001',
    userId: 'system'
  }
];

// 保存帖子到本地缓存
const savePostsToStorage = () => {
  wx.setStorageSync('forumPosts', posts);
};

module.exports = {
  // 获取所有帖子
  getPosts: () => [...posts],
  
  // 添加新帖子
  addPost: function (newPost) {
    newPost.createTime = util.formatTime(new Date()); // 统一时间格式
    posts.unshift(newPost); // 新帖子置顶
    savePostsToStorage(); // 同步到本地缓存
  },

  // 根据ID获取单篇帖子
  getPostById: (id) => posts.find(item => item.id === id) || {},

  // 清空帖子（可选）
  clearPosts: () => {
    posts = [];
    savePostsToStorage();
  }
};