import { message } from 'antd';

const preUrl = '/api/v2';

export async function post(url = '', data = {}, isToken = true) {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json();
}

export async function get(url = '', isToken = true) {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json();
}

export async function put(url = '', data = {}, isToken = true) {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json();
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json();
}
