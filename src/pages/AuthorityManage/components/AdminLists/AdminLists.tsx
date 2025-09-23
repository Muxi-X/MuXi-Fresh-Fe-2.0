import { Avatar, List } from 'antd';
import React from 'react';
import { AdminRow } from '../../AdminList.ts';
import ChangeUserTypeBox from './components/ChangeUserTypeBox/ChangeUserTypeBox.tsx';
import './AdminLists.less';

type AdminListsProps = {
  header: string;
  dataSource: AdminRow[];
  loading: boolean;
  user_type: 'super_admin' | 'admin' | 'normal';
  changeUserIdentity: (email: string, user_type: string, user_type_cn: string) => void;
};
const AdminLists: React.FC<AdminListsProps> = ({
  header,
  dataSource,
  loading,
  user_type,
  changeUserIdentity,
}) => {
  return (
    <List
      header={
        <div className={'adminListHeader'}>
          <b>{header}</b>
          <ChangeUserTypeBox
            header={header}
            user_type={user_type}
            changeUserIdentity={changeUserIdentity}
          />
        </div>
      }
      bordered
      className={'adminLists'}
      loading={loading}
      style={{ width: '20vw' }}
      pagination={{
        position: 'bottom',
        align: 'center',
        pageSize: 6,
        showSizeChanger: false,
        size: 'small',
      }}
      dataSource={dataSource}
      renderItem={(item) => (
        <List.Item className={'adminList'}>
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={item.nickname}
            description={
              <div>
                {item.name}
                <br />
                {item.email}
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default AdminLists;
