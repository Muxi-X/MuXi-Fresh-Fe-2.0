/**
 * 七牛直传相关的 JWT / key 工具。
 *
 * 后端已将客户端直传 token 的 scope 收窄为 `avatar/{jwtUserId}/` 前缀，
 * 前端所有直传 key 必须带该前缀，否则七牛会返回 403。
 */

/**
 * 从 localStorage 中的 JWT token 解析出当前登录用户的 jwtUserId。
 *
 * token 缺失、三段结构不合法、base64url 解码失败、payload 无 jwtUserId
 * 等情况一律返回空字符串，由调用方决定如何显式暴露失败。
 */
export function getJwtUserId(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';

  const parts = token.split('.');
  if (parts.length !== 3) return '';

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    return typeof payload.jwtUserId === 'string' ? payload.jwtUserId : '';
  } catch {
    return '';
  }
}

/**
 * 生成七牛直传 object key：avatar/{jwtUserId}/{timestamp}--{fileName}。
 *
 * 若解析不到 jwtUserId，直接抛出错误，避免静默生成 `avatar//xxx` 这类无效 key，
 * 让上传失败暴露出来。
 */
export function buildUploadKey(fileName: string): string {
  const userId = getJwtUserId();
  if (!userId) {
    throw new Error('无法解析当前登录用户的 jwtUserId，上传已终止');
  }
  return `avatar/${userId}/${Date.now()}--${fileName}`;
}

/**
 * base64url -> UTF-8 字符串。补齐 padding 后经 atob 解码，
 * 再通过 TextDecoder 处理非 ASCII（如中文）字符。
 */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}
