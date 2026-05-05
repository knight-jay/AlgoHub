import client from './client'
import type { Result, User, LoginResponse, RegisterData, LoginData, UpdateProfileData, ChangePasswordData } from '../types'

export const userApi = {
  register: (data: RegisterData) =>
    client.post<Result<string>>('/user/register', data),

  login: (data: LoginData) =>
    client.post<Result<LoginResponse>>('/user/login', data),

  getProfile: () =>
    client.get<Result<User>>('/user/profile'),

  updateProfile: (data: UpdateProfileData) =>
    client.put<Result<string>>('/user/profile', data),

  changePassword: (data: ChangePasswordData) =>
    client.put<Result<string>>('/user/password', data),
}
