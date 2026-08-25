import { message } from 'antd';

const preUrl = '/api/v2';

export async function post(url = '', data = {}, isToken = true): Promise<any> {
  const headers = new Headers({
    'Content-Type': 'application/json;charset=utf-8',
  });

  if (isToken) {
    const token = localStorage.getItem('token');
    if (token) headers.append('Authorization', token);
    else {
      void message.error('未登录！');
    }
  }

  const response = await fetch(`${preUrl}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401');
    } else if (response.status === 400) {
      const errorData = (await response.json()) as { code: number; msg: string };
      throw new Error(`${errorData.code}`);
    }
  }

  const res = (await response.json()) as { code?: number; [key: string]: unknown };
  if (res.code !== 200) {
    throw new Error(`${res.code}`);
  }
  return res;
}

export async function postBlob(url = '', data = {}, isToken = true) {
  const headers = new Headers({
    'Content-Type': 'application/json;charset=utf-8',
  });

  if (isToken) {
    const token = localStorage.getItem('token');
    if (token) headers.append('Authorization', token);
    else {
      void message.error('未登录！');
    }
  }

  const response = await fetch(`${preUrl}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return await response.blob();
}

/**
 * @param checkCode 是否校验业务 code。默认 true。
 *   个别接口（如 `/task/assigned/list/selected`）后端未包 `{ code, msg, data }`，
 *   直接返回业务数据，此时需传 false 跳过校验，否则 code 恒为 undefined 会误判为失败。
 */
export async function get(url = '', isToken = true, checkCode = true): Promise<any> {
  const headers = new Headers({
    'Content-Type': 'application/json;charset=utf-8',
  });

  if (isToken) {
    const token = localStorage.getItem('token');
    if (token) headers.append('Authorization', token);
    else {
      void message.error('未登录！');
    }
  }

  const response = await fetch(`${preUrl}${url}`, {
    method: 'GET',
    headers,
    redirect: 'follow',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401');
    } else if (response.status === 400) {
      const errorData = (await response.json()) as { code: number; msg: string };
      throw new Error(`${errorData.code}`);
    }
  }

  const res = (await response.json()) as { code?: number; [key: string]: unknown };
  if (checkCode && res.code !== 200) {
    throw new Error(`${res.code}`);
  }
  return res;
}

export async function put(url = '', data = {}, isToken = true): Promise<any> {
  const headers = new Headers({
    'Content-Type': 'application/json;charset=utf-8',
  });

  if (isToken) {
    const token = localStorage.getItem('token');
    if (token) headers.append('Authorization', token);
    else {
      void message.error('未登录！');
    }
  }

  const response = await fetch(`${preUrl}${url}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401');
    } else if (response.status === 400) {
      const errorData = (await response.json()) as { code: number; msg: string };
      throw new Error(`${errorData.code}`);
    }
  }

  const res = (await response.json()) as { code?: number; [key: string]: unknown };
  if (res.code !== 200) {
    throw new Error(`${res.code}`);
  }
  return res;
}

export async function postPwd(url = '', data = {}, token: string) {
  const headers = new Headers({
    'Content-Type': 'application/json;charset=utf-8',
  });

  if (token) headers.append('Authorization', token);
  else {
    void message.error(' 未登录！');
  }

  const response = await fetch(`${preUrl}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`${response.status}`);
  }

  return response.json();
}
