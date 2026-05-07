# 问答社区 API 文档

## 帖子接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts` | 帖子列表（分页），支持 `sort=time` 按时间排序 | 无需 |
| GET | `/api/posts/search` | 按关键词搜索帖子 | 无需 |
| GET | `/api/posts/my` | 我发布的帖子列表 | 需登录 |
| GET | `/api/posts/favorites` | 我收藏的帖子列表 | 需登录 |
| GET | `/api/posts/{id}` | 帖子详情 | 无需 |
| POST | `/api/posts` | 发布帖子（title + content） | 需登录 |
| PUT | `/api/posts/{id}` | 编辑帖子（仅作者可编辑） | 需登录 |
| DELETE | `/api/posts/{id}` | 删除帖子（仅作者可删除） | 需登录 |

## 互动接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/posts/{id}/like` | 点赞/取消点赞（切换） | 需登录 |
| POST | `/api/posts/{id}/favorite` | 收藏/取消收藏（切换） | 需登录 |
| POST | `/api/posts/{id}/follow` | 关注/取消关注帖子（切换） | 需登录 |
| POST | `/api/posts/{id}/report` | 举报帖子，body: `{reason}` | 需登录 |

## 评论接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/posts/{id}/comments` | 获取帖子评论列表（分页），支持嵌套回复（parent_id） | 无需 |
| POST | `/api/posts/{id}/comments` | 发表评论/回复 | 需登录 |
| DELETE | `/api/comments/{id}` | 删除评论（仅作者可删除） | 需登录 |
| POST | `/api/comments/{id}/report` | 举报评论，body: `{reason}` | 需登录 |

## 用户关注接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/users/{id}/follow` | 关注/取消关注用户（切换） | 需登录 |

## 管理员接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/reports` | 举报列表，支持按 `status` 筛选（PENDING/RESOLVED/DISMISSED） | ADMIN+ |
| PUT | `/api/admin/reports/{id}/resolve` | 处理举报（删除对应内容） | ADMIN+ |
| PUT | `/api/admin/reports/{id}/dismiss` | 驳回举报 | ADMIN+ |
| DELETE | `/api/admin/posts/{id}` | 管理员删除任意帖子 | ADMIN+ |
| DELETE | `/api/admin/comments/{id}` | 管理员删除任意评论 | ADMIN+ |

---

共 20 个接口，覆盖帖子的增删改查、点赞/收藏/关注、评论/回复、举报、管理员审核等完整流程。
