# 前端对接 —— 招新报名截止时间改为后端配置

## 背景

招新系统的报名截止时间目前**写死在前端**：

- `src/pages/formW/index.tsx:317-330`
- `src/pages/formM/index.tsx:308-322`

两处都是：

```tsx
const targetDate = new Date(currentDate.getFullYear(), 9, 27, 23, 59, 0); // 当年 10 月 27 日 23:59
if (currentDate > targetDate) { setIsPastDeadline(true); ... }
```

后端已新增接口，按**届次（年 + 春夏/秋）**维护截止时间。前端改为从接口读取，不再写死。

---

## 一、接口契约

所有响应走统一包装 `{ code, msg, data }`（`code === 200` 为成功），与现有接口一致；base 前缀同为 `/api/v2`（`src/fetch.ts` 的 `preUrl`）。

### 1. 查询截止时间（公开，无需登录）

```
GET /api/v2/recruit/deadline            // 取当前届次
GET /api/v2/recruit/deadline?cycle=2026autumn  // 指定届次（可选）
```

用现有 `get()`，**第二个参数传 `false`** 不附带 token：

```ts
const res = await get('/recruit/deadline', false);
// res.data = { cycle: '2026autumn', deadline: '2026-10-06 23:59:00', rev: 0 }
```

`data` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `cycle` | string | 届次，如 `2026autumn` / `2027spring` |
| `deadline` | string | 截止时间，格式 `YYYY-MM-DD HH:mm:ss`（东八区）；**空串表示不限制** |
| `rev` | number | 版本号，前端展示用不到；管理员保存时需回传 |

`cycle` 省略时后端按当前届次返回（7/1 为春秋分界）。报名页展示"当前届次截止时间"直接不传即可。

**空串 = 放行**：`deadline` 为空串时表示该届次未设截止（春招默认如此），前端**不应拦截**提交。

### 2. 设置截止时间（仅管理员）

```
PUT /api/v2/recruit/deadline
Authorization: <JWT>   // 用现有 put()
```

请求：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cycle` | string | 是 | 目标届次，`YYYYautumn` / `YYYYspring` |
| `deadline` | string | 是 | `YYYY-MM-DD HH:mm:ss`（东八区） |
| `rev` | number | 是 | 乐观锁版本号：先 GET 到 `rev` 再回传；首次写入传 `0` |

```ts
await put('/recruit/deadline', { cycle: '2026autumn', deadline: '2026-10-06 23:59:00', rev: 0 });
// 返回 { code: 200, msg: 'OK', data: { cycle, deadline, rev: 1 } }
```

成功返回写入后的新 `rev`，管理员界面连续保存用它更新本地值。

错误（`code: -1`，HTTP 200，`msg` 为文案）：

- 非管理员：`permission denied`
- 届次非法：`invalid cycle`；时间格式非法：`invalid deadline`；`rev` 为负：`invalid rev`
- **版本冲突**（加载后被他人先改）：`deadline has been modified, please refresh`，提示刷新重试

### 3. 默认行为（后端读时回退，不存库）

| 届次 | 未配置时的 GET 结果 |
| --- | --- |
| 秋招（`*autumn`） | `deadline = "<该年>-10-06 23:59:00"`（默认值，`rev = 0`） |
| 春招（`*spring`） | `deadline = ""`（放行，`rev = 0`） |

---

## 二、前端实现方案

### 1. 报名页（formW / formM）：把写死值换成接口值

改动点：`src/pages/formW/index.tsx`、`src/pages/formM/index.tsx` 的 `isPastDeadline` 逻辑。

- 原来在 `useEffect` 里用写死的 `targetDate` 比较；改为**进入页面时请求一次** `GET /recruit/deadline`（不传 token），拿 `deadline` 字符串：
  - `deadline` 为空串（或请求失败）→ 视为不限制，`isPastDeadline = false`（保持放行，避免因接口抖动误伤报名）。
  - 非空 → `new Date(deadline)` 与当前时间比较，逻辑同现有。
- 建议做**一次性缓存**（模块级变量或 request 去重），两个页面共用同一次请求，避免每个页面各打一次。
- 提交按钮的 `isPastDeadline` 禁用与点击时的 `message.warning('未在报名时间内')` 文案保持不变。

示意：

```ts
// 伪代码
useEffect(() => {
  let alive = true;
  get('/recruit/deadline', false)
    .then((res) => {
      if (!alive) return;
      const deadline = res.data?.deadline ?? '';
      if (deadline && new Date() > new Date(deadline)) {
        setIsPastDeadline(true);
        void message.warning('未在报名时间内');
      }
    })
    .catch(() => { /* 拿不到就不拦截 */ });
  return () => { alive = false; };
}, []);
```

注意：`new Date("2026-10-06 23:59:00")` 在浏览器里按**本地时区**解析，后端按东八区下发；用户在国内浏览器下与旧逻辑等价。

### 2. 管理员配置入口（若需要）

若要在管理端提供"设置截止时间"，用 `PUT /recruit/deadline`：

- 打开时先 `GET ?cycle=<目标届次>` 拿到当前 `deadline` 与 `rev` 回填；
- 保存时带上读到的 `rev`，成功后用返回的新 `rev` 更新本地；
- 顶到 `deadline has been modified, please refresh` 时提示刷新重试（不要静默覆盖）。
- 若暂无管理入口、只用数据库/脚本维护，前端可只做第 1 步（读取）。

---

## 三、验收清单

- [ ] formW / formM 不再写死日期，改为读取接口
- [ ] 后端已配置截止时间且当前时间已过 → 拦截提交，提示"未在报名时间内"
- [ ] 后端已配置但未到时间 → 正常提交
- [ ] 接口返回空串（未配置 / 春招）或请求失败 → 不拦截
- [ ] 两个页面不重复请求（有缓存 / 去重）
- [ ] （若做管理端）保存成功后本地 `rev` 更新，可连续保存；版本冲突有刷新提示

---

## 四、待确认

- 是否需要**管理端配置界面**；若需要，届次（年 + 春秋）如何让管理员选择
- 报名页只需要"当前届次"，是否所有场景都不传 `cycle`；若有按届次展示的历史/预览需求再传
