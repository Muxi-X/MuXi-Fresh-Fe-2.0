# 给前端 —— 作业附件上传失败会存成 `undefined`（与头像同一类根因）

> 影响面：学生提交作业（PC `/app/homework/user/submit`、移动端 `/app/homework/user/submit`）
> 关联：头像那版问题（`src/pages/formW`、`formM`、`HomePage`、`PersonalPage`）已修的点是"拼头像 URL 未校验 `response.key`"；作业是同一类写法，但代码路径是另一套，没有一起修。

## 一、现象

审阅页（`/app/homework/admin/judge`）打开某学生作业，附件链接指向

```
https://fresh.muxixyz.com/app/homework/admin/undefined
```

正常附件应是

```
https://ossfresh-test.muxixyz.com/avatar/<jwtUserId>/<时间戳>--<文件名>
```

## 二、这个链接是怎么来的（先说结论，避免误解）

**存储桶里没有 `undefined` 这个对象，前端也从来没真的访问过七牛。**

落到数据库里的坏值是**字面量字符串 `"undefined"`**（没有 `http` 前缀）。渲染时由附件组件兜底成一个相对路径：

```js
// src/pages/homework/components/files/index.tsx
<a href={item} ...>          // item === "undefined"
```

浏览器把 `href="undefined"` 当**相对路径**解析，相对当前页面 `/app/homework/admin/judge` 的目录 `/app/homework/admin/`，就变成了 `/app/homework/admin/undefined`。所以地址栏看到的是一个拼接产物，根因是库里存了 `"undefined"`。

## 三、根因（两处提交逻辑 + 一个失效的错误分支）

### 根因 1：移动端学生提交未过滤坏值（主要）

`src/pages/homework/pages/userMode/MobileSubmit/submitBeforeJudge.tsx`

```js
const tmpList = e?.map((item) => {
  if (item?.response) return `${root}${item.response.key as string}`;  // response 缺 key -> 拼出 ".../undefined"
  else return `${item.url as string}`;                                  // url 为 undefined -> 字面量 "undefined"
});
setFormData(tmpList);   // 直接 set，没有过滤
```

上传没成功时 `response` 为空、`url` 为 `undefined`，`${item.url}` 直接产出字符串 `"undefined"`，随后 `post /task/submitted` 原样提交，落库 `urls: ["undefined"]`。

### 根因 2：PC 学生提交同样未校验

`src/pages/homework/pages/userMode/submit/index.tsx`

```js
const tmpList = e?.map((item) => {
  if (item?.response) return ` ${root}${item?.response?.key as string}`;  // 注意开头有个空格
  else return `${item.url as string}`;
});
setformData(tmpList ? tmpList.filter((item) => item != 'undefined') : ['']);
```

`response` 存在但 `key` 缺失时，得到 `" https://ossfresh-test.muxixyz.com/undefined"`（**前面带一个空格**）。而这里的过滤条件是 `item != 'undefined'`：

- 带空格的值 `" .../undefined"` 不满足 `!= 'undefined'`，**过滤不掉**；
- 纯 `"undefined"` 也只是从数组里剔除，用户侧无任何提示。

### 根因 3：上传失败的错误分支永远走不到（导致问题被静默）

`src/pages/homework/components/upload/index.tsx`

```js
const handleFileChange: UploadProps['onChange'] = (info) => {
  // eslint-disable-next-line no-constant-condition
  if (info.file.status === 'done' || 'uploading') {   // 'uploading' 是非空字符串，恒为真
    ...
  } else if (info.file.status === 'error') {           // 永远进不来
    message.error(`${info.file.name} 文件上传失败`);
  }
};
```

`status === 'done' || 'uploading'` 里 `'uploading'` 是 truthy 字符串，整个条件恒为 true。后果：

- 上传失败时**不显示失败提示**；
- 但 `onChange(info.fileList)` 照常被调用，把失败文件（`response: undefined`）交给了根因 1/2 的拼 URL 逻辑。

### 附带：上传 token / key 生成失败没有兜底

- `src/pages/homework/components/upload/index.tsx` 在 `useEffect` 里取 `/auth/get-qntoken`，没判断 `res.data`，拿到空 token 也会走到 `qiniu.upload` 然后失败。
- `src/utils/jwt.ts` 的 `buildUploadKey` 在解析不到 `jwtUserId` 时会 `throw`；`upload/index.tsx` 的 `customRequest` 没有 try/catch，异常会被吞掉，表现为上传静默失败。

## 四、不受影响 / 已正确的点（避免误改）

- **管理员布置/修改作业**：`src/pages/homework/components/uploadWrap/index.tsx` 已经判断了 `'key' in response && typeof key === 'string'`，且对结果做了 `filter(item !== 'undefined' && item !== '')`。所以**管理员侧作业本身不会产生 `undefined`**，坏值来自学生提交。
- 头像四处（`formW` / `formM` / `HomePage` / `PersonalPage`）是另一套逻辑，之前已单独修（判断 `response?.key`）。

## 五、必须配合修改（后端将同步加校验）

后端会给**作业的两个写入口**加 URL 校验（与学生提交接口 `POST /task/submitted`、管理员接口 `POST /task/assigned` 对应）：

- 允许空数组；
- 每一项必须 `http`/`https` 且带 host，不得含拼接坏字面量（`undefined` / `null` / `NaN` / `[object Object]`）；
- 违反则请求被拒并返回错误。

**后果**：前端若仍拼出 `"undefined"` 或 `".../undefined"` 提交，会从"静默存坏值"变成**提交作业直接失败**。所以本次必须同步改前端。

## 六、修法

### 修法 1：提交前统一清洗（必须）

两处（移动端 `submitBeforeJudge.tsx`、PC `userMode/submit/index.tsx`）都改成：**只有拿到合法 key 才拼 URL，其余一律丢弃；最终数组过滤掉空串与 `undefined`。**

```js
const handleChangeUpload = (e) => {
  const urls = (e || [])
    .map((item) => {
      const key = item?.response?.key;
      if (typeof key === 'string' && key) {
        return `${root}${key}`;
      }
      // 已有 url（历史回显）时保留合法值
      if (typeof item?.url === 'string' && /^https?:\/\//.test(item.url)) {
        return item.url;
      }
      return '';
    })
    .filter((url) => url && !url.includes('undefined'));
  setFormData(urls);
};
```

要点：

- 用 `urls` 而不是 `tmpList`，**丢弃**而非保留坏项；
- 判断 `typeof key === 'string' && key`（沿用 `uploadWrap` 的正确写法）；
- 过滤条件要能拦住带空格的 `" .../undefined"`，用 `includes('undefined')` 比 `=== 'undefined'` 稳。

### 修法 2：修好上传失败的错误分支（必须）

`src/pages/homework/components/upload/index.tsx`：

```js
if (info.file.status === 'done' || info.file.status === 'uploading') {
  ...
} else if (info.file.status === 'error') {
  message.error(`${info.file.name} 文件上传失败`);
}
```

上传失败时要有可见提示，且**不要把失败文件当作已完成项交给上层**。

### 修法 3：提交前兜底守卫（建议）

发请求前再校验一次，坏值不提交：

```js
const isValidUrl = (url) => /^https?:\/\//.test(url) && !url.includes('undefined');
const valid = (formData || []).filter(isValidUrl);
if ((formData || []).some((u) => u && !isValidUrl(u))) {
  message.error('存在无效附件，请重新上传');
  return;
}
```

### 修法 4：提交失败要有可见报错（建议）

当前作业提交失败多为 `post(...).catch(() => message.error('提交失败'))`，错误文案笼统。建议后端返回具体原因时透出（可配合 `postWithMsg` 已有的取 `msg` 逻辑）。

## 七、验证

- 正常上传：`urls` 形如 `https://ossfresh-test.muxixyz.com/avatar/<userId>/<ts>--<name>`，提交后审阅页附件可下载。
- 模拟上传响应缺 `key` / 上传失败：页面提示失败，不产生 `"undefined"`，不提交坏值。
- 上传失败后点击提交：给出明确失败提示，不因坏 URL 被后端拒绝（或即使被拒也有可见文案）。
- 历史已提交作业的附件显示正常（历史坏值见下节，前端不负责回填）。

## 八、存量数据（2026-10-01 实查）

生产库 `submission` 集合中 `urls` 坏值实测：

- 含字面量 `"undefined"` 的文档 **31 条**，展开为数组元素共 **43 个**（个别提交一次挂了多个文件）；
- `urls` 含空字符串 `""` 的文档 **2 条**（前端 `formData` 初值 `['']`，未上传附件直接提交）；
- `assignment`（管理员作业附件）坏值为 **0**，与"管理员侧已正确校验 key"一致；
- `/undefined/` 模糊命中数 = 精确 `"undefined"` 命中数（31 = 31），说明**不存在带 host 前缀 `.../undefined` 或带前导空格的变体**——坏值全部来自"上传彻底失败、连 `response` 都没有"的 `else` 分支。

需区分本次窗口与历史数据，按 `createAt` 过滤：

```js
db.submission.find({ urls: "undefined" }).count()  // 全量
db.submission.countDocuments({ urls: "undefined", createAt: { $gte: ISODate("2026-08-31T16:00:00Z") } })
```

历史坏值由后端/运维一次性清理（按 `^https?://` 过滤坏项、从数组剔除，勿整条删提交记录），**前端不负责回填**；前端修复后不得再产生新坏值。

## 九、发布建议

**前后端同批发布**：后端先上线、前端未改 → 上传失败的学生交作业会被后端直接拒绝（且当前可能无可见报错），体验是回归。若无法同批，建议前端先行（前端加守卫对旧后端无害），或后端上线前确认前端已有"上传失败提示 + 坏值不提交"。

## 十、回退与上线安全

后端会同步给作业写接口加 URL 校验（非法项**拒绝**）。据此：

- **推荐**：前端与后端同批发布；前端可先合入，守卫对旧后端无害。
- **回退约束**：若后端校验已上线，而前端修复被回滚到旧版，上传失败的学生会重新提交 `"undefined"` 并被后端拒绝（且旧版无可见提示）→ 表现为"交不了作业"。所以**回退前端时必须连同后端校验一起回退**，或确保回退版本仍带"上传失败提示 + 坏值不提交"。二者不能只退一边。
- **上线后观测**：以 `db.submission.countDocuments({ urls: "undefined", createAt: { $gte: <上线时间> } })` 是否为 0 判断是否还有漏网；不为 0 说明仍有机型/路径走了旧逻辑。
- **后端校验若临时关闭**：只是不再拦截，坏值会继续落库，前端修复仍是必须项。
