// 后端统一响应格式
export interface Result<T = unknown> {
  code: number
  msg: string
  data: T
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

// 搜索响应
export interface SearchResult {
  total: number
  list: Algorithm[]
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
