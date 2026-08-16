import React, { useEffect, useRef, useState } from 'react';
import { TagList } from '../../pages/adminMode/judge/homePreview';
import { InboxOutlined, PaperClipOutlined } from '@ant-design/icons';
import { List } from 'antd';
import { isCodePenUrl, getCodePenEmbedUrl } from '../../utils/codepen';
import './index.less';

interface FileLinkProps {
  data: string[] | undefined;
  title?: string;
  className?: string;
  innerClass?: string;
  preview?: boolean;
}

const CodePenEmbed: React.FC<{ url: string }> = ({ url }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const handleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  return (
    <div className="codepen-embed-file">
      <div className="codepen-embed-toolbar">
        <a
          className="codepen-source-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          在 CodePen 中打开
        </a>
        <button className="codepen-fullscreen-btn" onClick={handleFullscreen}>
          {isFullscreen ? '退出全屏' : '全屏'}
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="codepen-embed-iframe"
        src={getCodePenEmbedUrl(url)}
        title="CodePen"
        sandbox="allow-scripts allow-same-origin allow-fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export const FileLinkPure: React.FC<FileLinkProps> = (props) => {
  const { data, innerClass, preview } = props;
  const renderText = (str: string) => {
    if (str?.length > 8) return str.slice(0, 8) + '...';
    return str;
  };
  return (
    <>
      <div className={innerClass}>
        {data &&
          data.map((item, index) => {
            // CodePen URL → render embedded iframe
            if (isCodePenUrl(item)) {
              return (
                <div key={item} className="codepen-embed-wrapper">
                  <CodePenEmbed url={item} />
                </div>
              );
            }

            // Original file link rendering
            return (
              <List.Item className={preview ? 'file-pre' : 'file'} key={item}>
                {preview ? (
                  <>
                    <img
                      className="file-preview"
                      src="https://s2.loli.net/2023/08/10/Wbg5lrvECMwHPSt.png"
                      alt=""
                    ></img>
                    <span className={'file-success'}>
                      <img
                        alt={''}
                        src={'https://s2.loli.net/2023/08/19/zTWilhg63dH8ING.png'}
                      ></img>
                      已上传
                    </span>
                  </>
                ) : (
                  <PaperClipOutlined className="file-icon" />
                )}
                <a
                  className="file-text"
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  href={item}
                  download={true}
                >
                  {item &&
                    renderText(
                      item.split('--')[1] ? item.split('--')[1] : `file-${index}`,
                    )}
                </a>
              </List.Item>
            );
          })}
        {!data && (
          <div className="empty-files">
            <InboxOutlined></InboxOutlined>
            <div className="empty-files-text">此作业暂无附件</div>
          </div>
        )}
      </div>
    </>
  );
};
const FileLink: React.FC<FileLinkProps> = (props) => {
  const { title, className } = props;
  return (
    <>
      <TagList tag_name={title ? title : '附件'} className={className}>
        <FileLinkPure {...props}></FileLinkPure>
      </TagList>
    </>
  );
};

export default FileLink;
