import React, { useEffect, useRef, useState } from 'react';
import { Input, message } from 'antd';
import { isCodePenUrl, getCodePenEmbedUrl } from '../../utils/codepen';
import './index.less';

export interface CodePenInputProps {
  defaultValue?: string;
  onChange?: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

const CodePenInput: React.FC<CodePenInputProps> = (props) => {
  const { defaultValue, onChange, disabled, className } = props;
  const [inputValue, setInputValue] = useState<string>(defaultValue || '');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync defaultValue when it changes (e.g. version switch)
  useEffect(() => {
    if (defaultValue !== undefined) {
      setInputValue(defaultValue);
      if (defaultValue && isCodePenUrl(defaultValue)) {
        setEmbedUrl(getCodePenEmbedUrl(defaultValue));
      } else {
        setEmbedUrl('');
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val && isCodePenUrl(val)) {
      setEmbedUrl(getCodePenEmbedUrl(val));
      onChange && onChange(val);
    } else {
      setEmbedUrl('');
      // Still propagate the value so the parent can handle validation
      onChange && onChange(val);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setEmbedUrl('');
    onChange && onChange('');
    message.success('已清除 CodePen 链接');
  };

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
    <div className={'codepen-input-wrap ' + (className || '')}>
      <div className="codepen-label">CodePen 链接</div>
      <div className="codepen-content">
        <Input
          placeholder="请输入 CodePen 链接，例如 https://codepen.io/user/pen/abc123"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          allowClear
          className="codepen-url-input"
        />
        {!embedUrl && inputValue && (
          <div className="codepen-hint">
            请输入有效的 CodePen 链接（包含 pen/details/full）
          </div>
        )}
        {embedUrl && (
          <div className="codepen-preview">
            <div className="codepen-preview-header">
              <span>预览</span>
              <div className="codepen-preview-actions">
                <span className="codepen-action-btn" onClick={handleFullscreen}>
                  {isFullscreen ? '退出全屏' : '全屏'}
                </span>
                <span className="codepen-clear" onClick={handleClear}>
                  清除
                </span>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              className="codepen-iframe"
              src={embedUrl}
              title="CodePen Preview"
              sandbox="allow-scripts allow-same-origin allow-fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePenInput;
