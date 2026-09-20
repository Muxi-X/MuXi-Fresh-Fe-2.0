import { Button, Input, Popconfirm, Space } from 'antd';
import React, { useState } from 'react';

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
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(newOpen);
      return;
    }
    if (email !== '') {
      setOpen(newOpen);
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
        description={`确定将 ${email} 设置为${header}吗？`}
        open={open}
        onOpenChange={handleOpenChange}
        onConfirm={() => {
          changeUserIdentity(email, user_type, header);
          handleClear();
        }}
        onCancel={handleClear}
        okText="Yes"
        cancelText="No"
      >
        <Button type="primary">确定</Button>
      </Popconfirm>
    </Space.Compact>
  );
};

export default ChangeUserTypeBox;
