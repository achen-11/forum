// @k-url /api/forum/auth/{action}

import { login, logout, sendVerificationCode, verifyVerificationCode, register, resetPassword, getCurrentUser, getUserDetail, updateProfile } from "code/Services/auth";
import { followUser, unfollowUser, getUserFollowersCount, getUserFollowingCount, isFollowing, getUserComments } from "code/Services/ForumUserService";
import { successResponse, failResponse } from "code/Utils/ResponseUtils";

/**
 * 登录
 * 支持：用户名/手机号/邮箱 + 密码 或 验证码
 */
k.api.post('login', (body: {
  account?: string;
  password?: string;
  verificationCode?: string;
  loginMode?: 'password' | 'code';
  isRemember?: boolean;
}) => {
  try {
    const data = login({
      account: body.account ?? '',
      password: body.password,
      verificationCode: body.verificationCode,
      loginMode: body.loginMode ?? 'password',
      isRemember: body.isRemember
    });
    return successResponse(data);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 发送验证码
 */
k.api.post('send-code', (body: {
  account?: string;
  accountType?: 'phone' | 'email';
  codeType?: 'login' | 'register' | 'forgot';
}) => {
  try {
    const data = sendVerificationCode({
      account: body.account ?? '',
      accountType: body.accountType ?? 'phone',
      codeType: body.codeType ?? 'login'
    });
    return successResponse(data);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 验证验证码
 */
k.api.post('verify-code', (body: {
  account?: string;
  accountType?: 'phone' | 'email';
  code?: string;
}) => {
  try {
    verifyVerificationCode({
      account: body.account ?? '',
      accountType: body.accountType ?? 'phone',
      code: body.code ?? ''
    });
    return successResponse(null, '验证码验证成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 注册
 */
k.api.post('register', (body: {
  userName?: string;
  phone?: string;
  email?: string;
  password?: string;
  verificationCode?: string;
  accountType?: 'username' | 'phone' | 'email';
}) => {
  try {
    const data = register({
      userName: body.userName,
      phone: body.phone,
      email: body.email,
      password: body.password ?? '',
      verificationCode: body.verificationCode ?? '',
      accountType: body.accountType ?? 'username'
    });
    return successResponse(data);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 重置密码
 */
k.api.post('reset-password', (body: {
  account?: string;
  accountType?: 'phone' | 'email' | 'username';
  newPassword?: string;
  verificationCode?: string;
}) => {
  try {
    resetPassword({
      account: body.account ?? '',
      accountType: body.accountType ?? 'phone',
      newPassword: body.newPassword ?? '',
      verificationCode: body.verificationCode ?? ''
    });
    return successResponse(null, '密码重置成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 退出登录
 */
k.api.post('logout', () => {
  try {
    logout();
    return successResponse(null, '已退出');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 获取当前用户信息
 */
k.api.get('me', () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return failResponse('登录已过期');
    }
    return successResponse(user);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 获取用户详情
 * 使用 k.request.get('userId') 获取查询参数，避免回调参数在 Kooboo 中为 null
 */
k.api.get('user-detail', () => {
  try {
    const userId = k.request.get('userId')
    if (!userId) {
      return failResponse('缺少用户ID');
    }
    const user = getUserDetail(userId);
    return successResponse(user);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 更新当前用户资料（仅 displayName、avatar）
 * 需登录，仅能更新本人。
 */
k.api.post('update-profile', (body: {
  displayName?: string;
  avatar?: string;
}) => {
  try {
    const user = updateProfile({
      displayName: body.displayName,
      avatar: body.avatar
    });
    return successResponse(user, '更新成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 关注用户
 * 需登录
 */
k.api.post('follow', (body: {
  followingId?: string;
}) => {
  try {
    if (!body.followingId) {
      return failResponse('缺少 followingId');
    }
    const result = followUser(body.followingId);
    return successResponse(result, result.message);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 取消关注
 * 需登录
 */
k.api.post('unfollow', (body: {
  followingId?: string;
}) => {
  try {
    if (!body.followingId) {
      return failResponse('缺少 followingId');
    }
    const result = unfollowUser(body.followingId);
    return successResponse(result, result.message);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 获取用户粉丝数量
 */
k.api.get('user-followers', () => {
  try {
    const userId = k.request.get('userId')
    if (!userId) {
      return failResponse('缺少用户ID');
    }
    const count = getUserFollowersCount(userId);
    return successResponse({ count });
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 获取用户关注数量
 */
k.api.get('user-following', () => {
  try {
    const userId = k.request.get('userId')
    if (!userId) {
      return failResponse('缺少用户ID');
    }
    const count = getUserFollowingCount(userId);
    return successResponse({ count });
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 检查当前登录用户是否已关注目标用户
 * 需登录
 */
k.api.get('is-following', () => {
  try {
    const followingId = k.request.get('followingId')
    if (!followingId) {
      return failResponse('缺少 followingId');
    }
    const result = isFollowing(followingId);
    return successResponse({ isFollowing: result });
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 获取用户评论列表
 */
k.api.get('user-comments', () => {
  try {
    const userId = k.request.get('userId')
    if (!userId) {
      return failResponse('缺少用户ID');
    }
    const limit = parseInt(k.request.get('limit') || '20', 10);
    const comments = getUserComments(userId, limit);
    return successResponse(comments);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});