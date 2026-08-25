import './AuthorityManage.less';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { get, post } from '../../fetch.ts';
import { AdminList, AdminRow } from './AdminList.ts';
import AdminLists from './components/AdminLists/AdminLists.tsx';
import { useNavigate } from 'react-router-dom';

const AuthorityManage = () => {
  const [superAdmin, setSuperAdmin] = useState<AdminRow[]>([]);
  const [admin, setAdmin] = useState<AdminRow[]>([]);
  const [ordinary, setOrdinary] = useState<AdminRow[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const getUserList = (
    user_type: string,
    setState: React.Dispatch<React.SetStateAction<AdminRow[]>>,
    user_type_cn: string,
  ) => {
    setLoading(true);
    get(`/users/admin-list?user_type=${user_type}`)
      .then((r: AdminList) => {
        const { list } = r.data;
        if (list === null) setState([]);
        else setState(list);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (Number(e.message) === 10003) {
          void message.error('您无此权限，请退出！').then(() => {
            navigate('/app');
          });
        } else {
          void message.error(`获取${user_type_cn}列表失败，请稍后重试`);
          console.error(e);
        }
      });
  };

  const [isChange, setIsChange] = useState(false);
  useEffect(() => {
    getUserList('super_admin', setSuperAdmin, '超级管理员');
    getUserList('admin', setAdmin, '管理员');
    getUserList('normal', setOrdinary, '普通用户');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChange]);

  const changeUserIdentity = (email: string, user_type: string, user_type_cn: string) => {
    post('/users/type', {
      email: email,
      user_type: user_type,
    }).then(
      () => {
        void message.success(`设置${user_type_cn}成功`);
        setIsChange(!isChange);
      },
      (e: Error) => {
        if (Number(e.message) === -1) {
          void message.error('请检查邮箱是否正确');
        } else {
          void message.error(`设置${user_type_cn}失败，请稍后重试`);
        }
        console.error(e);
      },
    );
  };

  return (
    <>
      <div className="authorityManageBox">
        <div className={'authorityManage'}>
          <AdminLists
            header={'超级管理员'}
            dataSource={superAdmin}
            user_type={'super_admin'}
            loading={loading}
            changeUserIdentity={changeUserIdentity}
          ></AdminLists>
          <AdminLists
            header={'管理员'}
            dataSource={admin}
            user_type={'admin'}
            loading={loading}
            changeUserIdentity={changeUserIdentity}
          ></AdminLists>
          <AdminLists
            header={'普通成员'}
            dataSource={ordinary}
            user_type={'normal'}
            loading={loading}
            changeUserIdentity={changeUserIdentity}
          ></AdminLists>
        </div>
      </div>
    </>
  );
};

export default AuthorityManage;
