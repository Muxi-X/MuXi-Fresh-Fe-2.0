# 前端对接：删除作业接口 `DELETE /api/v2/task/assigned/:id`

> 后端接口一直在（task 服务初版就有），只是前端未接。用于管理员删除发错组/发错的作业（题目）。
> 相关文件：`app/task/cmd/api/task.api:262`、`app/task/cmd/api/internal/logic/assigned/delassignmentlogic.go`

---

## 一、接口定义

```
DELETE /api/v2/task/assigned/:id
Authorization: <JWT>
```

| 项 | 说明 |
|---|---|
| 方法 | `DELETE` |
| 路径参数 | `id`：作业 ID（MongoDB ObjectID 的 24 位十六进制串） |
| 请求体 | 无 |
| 鉴权 | 需要 JWT，`Authorization` 头；且调用者 `user_type` 必须是 `admin` 或 `super_admin` |
| 权限 | 非管理员返回业务错误 `permission denied`（对应 `delassignmentlogic.go:40`） |

### 请求示例

```http
DELETE /api/v2/task/assigned/65f1c2a3b4d5e6f708192a3b HTTP/1.1
Host: <api-host>
Authorization: <JWT>
```

### 成功响应

后端统一响应包装为 `{ code, msg, data }`（`common/greet/response/response.go`），**HTTP 状态码始终 200**，成功与否看 `code`：

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "flag": true
  }
}
```

### 失败响应

`code` 为 `-1`，`msg` 为错误文案，`data` 省略：

```json
{
  "code": -1,
  "msg": "permission denied"
}
```

> 前端判断成功必须使用 `code === 200`；`data.flag === true` 只能作为可选的一致性校验，不能替代 `code` 判断。不要只看 HTTP 200。

---

## 二、前端怎么拿到要删的 `id`

来自作业列表接口，`titles[].id` 即作业 ID：

```
GET /api/v2/task/assigned/list?group=Product
```

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "titles": [
      { "id": "65f1c2a3b4d5e6f708192a3b", "text": "产品组第一次作业" }
    ]
  }
}
```

也可用带年份学期的列表 `GET /api/v2/task/assigned/list/selected?group=Product&year=2026&semester=autumn`。

---

## 三、重要行为：删除不级联（务必让用户二次确认）

`DelAssignment` 只按 `_id` 删除 assignment 这一条文档（`app/task/cmd/rpc/assignment/internal/logic/delAssignmentLogic.go:25`），**不会**清理关联数据：

- 提交记录 `submissions.assignment_id` 指向该作业，删除后成为孤儿，不会自动删；
- 评论 `comments.submission_id` 关联提交，同样不会自动删。

即作业删除后**不可恢复**。前端务必加二次确认弹窗，明确提示"删除后该作业将无法恢复；已有学员提交记录不会被自动删除，但会失去有效的作业关联"。

> 若产品组已有新人提交过，删完库里会残留指向不存在作业的 submission。后端目前没有级联清理逻辑，如需要请另行提需求。

---

## 四、更推荐的处理方式：组别填错的场景用"修改"而非"删除"

如果只是**作业内容正确、组别选错**（如把设计组作业发到了产品组），直接用修改接口把 `group` 改正更干净：

```
POST /api/v2/task/assigned
```

请求体带原字段并用 `assignedTaskID` 指定要改的作业（`task.api:116`）：

```json
{
  "assignedTaskID": "65f1c2a3b4d5e6f708192a3b",
  "group": "Design",
  "title_text": "...",
  "content": "...",
  "urls": [],
  "year": 2026,
  "semester": "autumn",
  "deadline": "2026-10-01 23:59:59"
}
```

这样作业 `_id` 不变，已有的提交关联全部保留。`group` 枚举：`Product / Design / Frontend / Backend / Android / Operation`。

---

## 五、建议的前端交互

1. 进入作业管理页，拉取对应组别的作业列表，每条作业提供"删除"入口（仅 `admin/super_admin` 可见）。
2. 点击弹出确认框，展示作业标题，提示不可逆。
3. 确认后调用 `DELETE /api/v2/task/assigned/:id`。
4. `code === 200` 则提示成功并刷新列表；否则 `message.error(msg)`。
5. 若只是组别错误，优先走"编辑"用修改接口改 `group`，不要删。
