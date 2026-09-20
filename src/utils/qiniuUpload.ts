import type { UploadProps } from 'antd/es/upload/interface';
import * as qiniu from 'qiniu-js';
import { get } from '../fetch';
import { buildUploadKey } from './jwt';

export interface QiniuUploadResponse {
  key: string;
  hash: string;
}

interface GetQiniuTokenResult {
  code: number;
  msg: 'OK';
  data: {
    QiniuToken: string;
  };
}

type QiniuCustomRequest = UploadProps<QiniuUploadResponse>['customRequest'];

/**
 * 七牛头像直传的公共 customRequest。
 *
 * 每次真正发起上传前即时调用 /auth/get-qntoken 获取最新 Upload Token，
 * 避免页面挂载时一次性获取、长期复用导致 token 过期（偶发）。
 * token 存于函数局部变量并直接传给 qiniu.upload，不经 React state，
 * 杜绝 state 异步导致上传时复用旧 token。
 */
export const qiniuCustomRequest: QiniuCustomRequest = (options) => {
  get('/auth/get-qntoken', true)
    .then((r: GetQiniuTokenResult) => {
      const { QiniuToken } = r.data;
      const file = options.file as File;
      const key = buildUploadKey(file.name);
      const putExtra = { fname: `${Date.now()}--${file.name}` };
      const config = {
        useCdnDomain: true,
        region: qiniu.region.z2,
      };
      const observable = qiniu.upload(file, key, QiniuToken, putExtra, config);
      const subscription = observable.subscribe({
        next: (res) => {
          options.onProgress?.({ percent: res.total.percent });
        },
        error: (err) => {
          options.onError?.(err);
          subscription.unsubscribe();
        },
        complete: (res) => {
          options.onSuccess?.(res as QiniuUploadResponse);
          subscription.unsubscribe();
        },
      });
    })
    .catch((e: unknown) => {
      options.onError?.(e as Error);
    });
};
