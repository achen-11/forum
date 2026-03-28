// @k-url /api/forum/auth/{action}

import { login, logout, sendVerificationCode, verifyVerificationCode, register, resetPassword, getCurrentUser, getUserDetail, updateProfile, changePassword, bindEmail, bindPhone, verifyOldContact, replaceEmail, replacePhone, koobooLogin, koobooBindCheck, koobooUnbind } from "code/Services/auth";
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
 * Kooboo 登录
 * 从 Kooboo 登录页返回后调用
 */
k.api.post('kooboo-login', () => {
  try {
    const data = koobooLogin();
    return successResponse(data);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * Kooboo 绑定检查
 * 需登录，检测当前 Kooboo 账号是否已绑定其他用户
 */
k.api.get('kooboo-bind-check', () => {
  try {
    const data = koobooBindCheck();
    return successResponse(data);
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * Kooboo 解绑
 * 需登录，输入密码确认，解绑前检查是否有手机或邮箱
 */
k.api.post('kooboo-unbind', (body: {
  password?: string;
}) => {
  try {
    if (!body.password) {
      return failResponse('请输入密码');
    }
    const data = koobooUnbind(body.password);
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
  codeType?: 'login' | 'register' | 'forgot' | 'bind' | 'verify_old';
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
    // 检查用户是否有 koobooId，如果有则登出 Kooboo
    const currentUser = getCurrentUser();
    if (currentUser?.koobooId && k.account.isLogin) {
      k.account.user.logout();
    }
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

/**
 * 修改密码
 * 需登录，验证旧密码后修改
 */
k.api.post('change-password', (body: {
  oldPassword?: string;
  newPassword?: string;
}) => {
  try {
    changePassword({
      oldPassword: body.oldPassword ?? '',
      newPassword: body.newPassword ?? ''
    });
    return successResponse(null, '密码修改成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 绑定邮箱（首次绑定）
 * 需登录
 */
k.api.post('bind-email', (body: {
  email?: string;
  verificationCode?: string;
}) => {
  try {
    if (!body.email) {
      return failResponse('请输入邮箱地址');
    }
    if (!body.verificationCode) {
      return failResponse('请输入验证码');
    }
    const user = bindEmail(body.email, body.verificationCode);
    return successResponse(user, '邮箱绑定成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 绑定手机（首次绑定）
 * 需登录
 */
k.api.post('bind-phone', (body: {
  phone?: string;
  verificationCode?: string;
}) => {
  try {
    if (!body.phone) {
      return failResponse('请输入手机号');
    }
    if (!body.verificationCode) {
      return failResponse('请输入验证码');
    }
    const user = bindPhone(body.phone, body.verificationCode);
    return successResponse(user, '手机号绑定成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 验证旧邮箱/手机（用于更换绑定时的身份验证）
 * 需登录
 */
k.api.post('verify-old-contact', (body: {
  account?: string;
  accountType?: 'phone' | 'email';
  code?: string;
}) => {
  try {
    if (!body.account) {
      return failResponse('请输入账号');
    }
    if (!body.accountType) {
      return failResponse('请选择账号类型');
    }
    if (!body.code) {
      return failResponse('请输入验证码');
    }
    verifyOldContact(body.accountType, body.account, body.code);
    return successResponse(null, '验证成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 更换邮箱（先验证旧的，再绑定新的）
 * 需登录
 */
k.api.post('replace-email', (body: {
  oldEmail?: string;
  oldCode?: string;
  newEmail?: string;
  newCode?: string;
}) => {
  try {
    if (!body.oldEmail) {
      return failResponse('请输入旧邮箱');
    }
    if (!body.oldCode) {
      return failResponse('请输入旧邮箱验证码');
    }
    if (!body.newEmail) {
      return failResponse('请输入新邮箱');
    }
    if (!body.newCode) {
      return failResponse('请输入新邮箱验证码');
    }
    const user = replaceEmail(body.oldEmail, body.oldCode, body.newEmail, body.newCode);
    return successResponse(user, '邮箱更换成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});

/**
 * 更换手机（先验证旧的，再绑定新的）
 * 需登录
 */
k.api.post('replace-phone', (body: {
  oldPhone?: string;
  oldCode?: string;
  newPhone?: string;
  newCode?: string;
}) => {
  try {
    if (!body.oldPhone) {
      return failResponse('请输入旧手机号');
    }
    if (!body.oldCode) {
      return failResponse('请输入旧手机验证码');
    }
    if (!body.newPhone) {
      return failResponse('请输入新手机号');
    }
    if (!body.newCode) {
      return failResponse('请输入新手机验证码');
    }
    const user = replacePhone(body.oldPhone, body.oldCode, body.newPhone, body.newCode);
    return successResponse(user, '手机号更换成功');
  } catch (e: any) {
    return failResponse(e?.message || '服务器错误');
  }
});