/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { message, Upload, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as qiniu from 'qiniu-js';
import { get } from '../../../../fetch.ts';
import { FileLinkPure } from '../files';
import Submit from '../button';
import './index.less';
import { root } from '../../utils/deData';
import { buildUploadKey } from '../../../../utils/jwt.ts';
import { normalizeAttachmentUrls } from '../../utils/attachmentUrls';

const { Dragger } = Upload;
interface UploaderProps {
  className?: string;
  onChange: (files: UploadProps['fileList']) => void;
  defaultList?: string[];
  disabled?: boolean;
  mobile?: boolean;
}

const Uploader: React.FC<UploaderProps> = (props) => {
  const [qntoken, setQntoken] = useState<string>('');
  const { className, onChange, defaultList, disabled, mobile } = props;
  const [fileList, setfileList] = useState<any[] | undefined>();
  useEffect(() => {
    get('/auth/get-qntoken').then(
      (res) => {
        const token: unknown = res?.data?.QiniuToken as unknown;
        if (typeof token === 'string' && token) {
          setQntoken(token);
        } else {
          void message.error('获取上传凭证失败，请刷新页面后重试');
        }
      },
      (e) => {
        void message.error('网络状况不佳');
        console.error(e);
      },
    );
  }, []);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (defaultList) {
      const tmp = defaultList
        .filter((item) => item)
        ?.map((item, index) => {
          return {
            uid: `${Date.now()}${item}`,
            name: item.split('--')[1] ? item.split('--')[1] : `file-${index}`,
            status: 'done',
            url: item,
          };
        });
      onChange(tmp as any[]);
      setfileList(tmp[0] ? tmp : []);
    } else {
      setfileList(undefined);
    }
  }, [defaultList]);
  const handleFileChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
    setfileList(info.fileList);
    onChange(info.fileList);
  };
  const handleRemove = (file: any) => {
    if (fileList) {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setfileList(newFileList);
      onChange(newFileList);
    }
  };
  const customRequest = (options: any) => {
    let key: string;
    try {
      if (!qntoken) throw new Error('上传凭证无效');
      key = buildUploadKey(options.file.name as string);
    } catch (error) {
      options.onError(error instanceof Error ? error : new Error('无法准备上传'));
      return;
    }
    const putExtra = {
      fname: `${Date.now()}--${options.file.name as string}`,
    };
    const config = {};
    try {
      const observable = qiniu.upload(
        options.file as File,
        key,
        qntoken,
        putExtra,
        config,
      );
      const subscription: any = observable.subscribe({
        next: (res) => {
          options.onProgress({ percent: res.total.percent });
        },
        error: (err) => {
          options.onError(err);
          if (subscription) subscription.unsubscribe();
        },
        complete: (res) => {
          options.onSuccess(res);
          if (subscription) subscription.unsubscribe();
        },
      });
    } catch (error) {
      options.onError(error instanceof Error ? error : new Error('文件上传失败'));
    }
  };
  return (
    <>
      {mobile ? (
        <Dragger
          customRequest={customRequest}
          onChange={handleFileChange}
          onRemove={handleRemove}
          multiple={true}
          className={`def-upload-mobile ${className as string}`}
          fileList={fileList}
          showUploadList={false}
          disabled={disabled ? disabled : false}
          style={{
            backgroundColor: '#fff',
            border: '0',
          }}
        >
          {fileList ? (
            <FileLinkPure
              preview
              className="file-preview-mobile"
              data={normalizeAttachmentUrls(fileList, root)}
            ></FileLinkPure>
          ) : (
            <img
              src="https://s2.loli.net/2023/08/10/Wbg5lrvECMwHPSt.png"
              className="ant-upload-drag-icon"
              alt={''}
            ></img>
          )}
          {!fileList && <div className="upload-mobile-mob">选择文件</div>}
          <p className="ant-upload-hint" style={{ marginTop: '20px' }}>
            支持常见文件格式，可以批量上传
          </p>
          {fileList && (
            <div className="upload-havefile-mobile">
              <div className="continue upload-mobile-mob">继续选择</div>
              <div
                className="clear upload-mobile-mob"
                onClick={(e) => {
                  e.stopPropagation();
                  setfileList(undefined);
                  onChange([]);
                  message.success('文件清除成功');
                }}
              >
                重新选择
              </div>
            </div>
          )}
        </Dragger>
      ) : (
        <Upload
          customRequest={customRequest}
          onChange={handleFileChange}
          onRemove={handleRemove}
          showUploadList={true}
          multiple={true}
          className={`def-upload ${className as string}`}
          fileList={fileList}
          disabled={disabled ? disabled : false}
        >
          {
            <Submit
              className="def-button"
              disabled={disabled ? disabled : false}
              icon={<UploadOutlined />}
            >
              上传
            </Submit>
          }
        </Upload>
      )}
    </>
  );
};

export default Uploader;
