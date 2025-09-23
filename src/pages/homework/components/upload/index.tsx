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
        setQntoken(res.data.QiniuToken as string);
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
    // eslint-disable-next-line no-constant-condition
    if (info.file.status === 'done' || 'uploading') {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      }
      setfileList(info.fileList);
      onChange(info.fileList);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
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
    const putExtra = {
      fname: `${Date.now()}--${options.file.name as string}`,
    };
    const config = {};
    const observable = qiniu.upload(
      options.file as File,
      `${Date.now()}--${options.file.name as string}`,
      qntoken,
      putExtra,
      config,
    );
    // 监听上传
    const subscription: any = observable.subscribe({
      next: (res) => {
        options.onProgress({ percent: res.total.percent });
      },
      error: (err) => {
        options.onError(err);
        if (subscription) {
          subscription.unsubscribe();
        }
      },
      complete: (res) => {
        options.onSuccess(res);
        if (subscription) {
          subscription.unsubscribe();
        }
      },
    });
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
              data={
                fileList &&
                fileList.map((item) => {
                  const key: string | undefined = item.response?.key as
                    | string
                    | undefined;
                  if (key) {
                    return `${root}${key}`;
                  }
                  return item.url as string;
                })
              }
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
