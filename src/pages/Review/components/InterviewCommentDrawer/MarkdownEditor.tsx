import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

// 面评 markdown 编辑器的唯一隔离层：更换编辑器时尽量只改本文件。
type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 400,
}) => (
  <div data-color-mode="light">
    <MDEditor value={value} onChange={(v) => onChange(v ?? '')} height={height} />
  </div>
);

export default MarkdownEditor;
