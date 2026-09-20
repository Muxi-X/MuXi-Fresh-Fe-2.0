import { Avatar, Button, Input, message, Popconfirm, Space } from 'antd';
import React, { useState } from 'react';
import { get } from '../../../../../../fetch.ts';

type PreviewUser = {
  avatar: string;
  nickname: string;
  name: string;
  email: string;
  user_type: 'freshman' | 'normal' | 'admin' | 'super_admin';
};

const userTypeText: Record<PreviewUser['user_type'], string> = {
  freshman: '新生',
  normal: '普通成员',
  admin: '管理员',
  super_admin: '超级管理员',
};

type ChangeUserTypeBoxProps = {
  header: string;
  user_type: 'super_admin' | 'admin' | 'normal';
  changeUserIdentity(email: string, user_type: string, user_type_cn: string): void;
};

const ChangeUserTypeBox: React.FC<ChangeUserTypeBoxProps> = ({
  header,
  user_type,
  changeUserIdentity,
}) => {
  const [email, setEmail] = useState(''); // 创建一个状态变量来存储输入框的值
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleClear = () => {
    setEmail('');
  };
  const [open, setOpen] = useState(false);
  const [previewUser, setPreviewUser] = useState<PreviewUser | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const handleOpenChange = async (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(newOpen);
      return;
    }
    if (email.trim() === '' || previewLoading) {
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await get(`/users/preview?email=${encodeURIComponent(email)}`);
      setPreviewUser(res.data as PreviewUser);
      setOpen(true);
    } catch {
      void message.error('未找到该邮箱对应的用户，请检查邮箱是否与注册时一致');
    } finally {
      setPreviewLoading(false);
    }
  };
  return (
    <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
      <Input
        placeholder={`请输入邮箱添加成员`}
        value={email}
        onChange={handleChange}
        allowClear
      />
      <Popconfirm
        title={`添加${header}`}
        description={
          previewUser ? (
            <Space align="start">
              <Avatar src={previewUser.avatar || undefined}>{previewUser.nickname?.[0]}</Avatar>
              <div>
                <div>{previewUser.nickname}</div>
                <div>{previewUser.name}</div>
                <div>{previewUser.email}</div>
                <div>当前身份：{userTypeText[previewUser.user_type]}</div>
                <div>确定将 {previewUser.email} 设置为{header}吗？</div>
              </div>
            </Space>
          ) : null
        }
        open={open}
        onOpenChange={handleOpenChange}
        onConfirm={() => {
          changeUserIdentity(email, user_type, header);
          setOpen(false);
          setPreviewUser(null);
          handleClear();
        }}
        onCancel={() => {
          setOpen(false);
          setPreviewUser(null);
          handleClear();
        }}
        okText="Yes"
        cancelText="No"
      >
        <Button type="primary">确定</Button>
      </Popconfirm>
    </Space.Compact>
  );
};

export default ChangeUserTypeBox;
