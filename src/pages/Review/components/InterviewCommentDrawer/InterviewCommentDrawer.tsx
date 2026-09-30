import React, { useEffect, useState } from 'react';
import { Button, Drawer, Space, message } from 'antd';
import { postWithMsg } from '../../../../fetch.ts';
import type { ReviewRow } from '../../ReviewList.ts';
import MarkdownEditor from './MarkdownEditor.tsx';

const MAX_LEN = 20000;

type InterviewCommentDrawerProps = {
  open: boolean;
  record: ReviewRow | null;
  onClose: () => void;
  onSaved: (formId: string) => void;
};

const InterviewCommentDrawer: React.FC<InterviewCommentDrawerProps> = ({
  open,
  record,
  onClose,
  onSaved,
}) => {
  const [value, setValue] = useState('');
  const [rev, setRev] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(record?.interview_comment ?? '');
    setRev(record?.interview_comment_rev ?? 0);
  }, [record]);

  const handleSave = async () => {
    if (!record) return;
    if (value.length > MAX_LEN) {
      void message.error(`面评不能超过 ${MAX_LEN} 字符`);
      return;
    }
    setSaving(true);
    try {
      await postWithMsg('/review/interview_comment', {
        form_id: record.form_id,
        comment: value,
        rev,
      });
      void message.success('保存成功');
      onSaved(record.form_id);
    } catch (e) {
      void message.error(
        e instanceof Error && e.message ? e.message : '保存失败，请稍后重试',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={`面评 · ${record?.name ?? ''}`}
      width={640}
      open={open}
      onClose={onClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            保存
          </Button>
        </Space>
      }
    >
      <MarkdownEditor value={value} onChange={setValue} />
    </Drawer>
  );
};

export default InterviewCommentDrawer;
