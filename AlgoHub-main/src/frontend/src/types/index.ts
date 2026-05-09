// 后端统一响应格式
export interface Result<T = unknown> {
  code: number
  msg: string
  data: T
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户
export interface User {
  id: number
  username: string
  phone: string
  nickname?: string
  intro?: string
  role: 'STUDENT' | 'ADMIN' | 'MASTER'
  locked: number
  createTime: string
  updateTime: string
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: {
    userId: number
    username: string
    role: string
  }
}

// 算法分类
export interface AlgorithmCategory {
  id: number
  name: string
  parentId: number | null
  sortOrder: number
  createTime: string
  children?: AlgorithmCategory[]
}

// 算法
export interface Algorithm {
  id: number
  title: string
  description?: string
  usageIntro?: string
  cppTemplate?: string
  categoryId: number | null
  difficulty: string
  tags?: string
  createTime: string
  updateTime: string
}

// 注册 DTO
export interface RegisterData {
  username: string
  password: string
  confirmPassword: string
  phone: string
  nickname: string
  role: string
}

// 登录 DTO
export interface LoginData {
  username: string
  password: string
  rememberMe: boolean
  role: string
}

// 修改密码 DTO
export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 忘记密码 DTO
export interface ForgotPasswordData {
  phone: string
  newPassword: string
  confirmPassword: string
}

// 修改个人信息 DTO
export interface UpdateProfileData {
  phone?: string
  nickname?: string
  intro?: string
}

// ==================== 学习资源 ====================

export interface ResourceCategory {
  id: number
  name: string
  sortOrder: number
  createTime: string
}

export interface Resource {
  id: number
  title: string
  description?: string
  url: string
  categoryId: number | null
  sortOrder: number
  createTime: string
  updateTime: string
}

// ==================== 问答社区 ====================

export interface Post {
  id: number
  title: string
  content: string
  userId: number
  likeCount: number
  commentCount: number
  createTime: string
  updateTime: string
  isLiked?: boolean
  isFavorited?: boolean
  isFollowed?: boolean
  user?: {
    id: number
    username: string
    nickname?: string
  }
}

export interface Comment {
  id: number
  postId: number
  userId: number
  parentId: number | null
  content: string
  createTime: string
  user?: {
    id: number
    username: string
    nickname?: string
  }
}

export interface PostReport {
  id: number
  postId: number | null
  commentId: number | null
  reporterId: number
  reason: string
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED'
  handlerId: number | null
  handleNote: string | null
  createTime: string
  handleTime: string | null
  reporter?: {
    id: number
    username: string
    nickname?: string
  }
}

export interface CreatePostData {
  title: string
  content: string
}

export interface UpdatePostData {
  title?: string
  content?: string
}

export interface CreateCommentData {
  content: string
  parentId?: number
}
