import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Layout.less';
import React, { useEffect, useState } from 'react';
import { get } from '../../fetch.ts';
import { PersonalInformation } from '../../type/PersonalInformation.ts';
import type { MenuProps } from 'antd';
import {
  Avatar,
  ConfigProvider,
  Dropdown,
  Layout as LayoutAntd,
  Menu,
  message,
} from 'antd';
import { UserIdentity, UserIsForm } from '../Verify/UserIdentity.ts';

const { Header, Content, Sider } = LayoutAntd;

const muxi_logo =
  'https://ossfresh-test.muxixyz.com/%E5%B7%A6%E4%B8%8A%E8%A7%92%401x%281%29.png';
const defaultAvatar = 'https://muxi-fresh.muxixyz.com/fe-static/default_avatar.png';

type LayoutProps = {
  identity: UserIdentity;
  isForm: UserIsForm;
};

const Layout: React.FC<LayoutProps> = ({ identity, isForm }) => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('/app/form'); // 默认选中的菜单项

  useEffect(() => {
    get('/users/my-info').then(
      (r: PersonalInformation) => {
        const { avatar } = r.data;
        setAvatar(avatar);
      },
      (e) => {
        console.error(e);
      },
    );
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const navigationClick = (target: string) => {
    setSelectedMenuKey(target); // 更新选中的菜单项
    navigate(target);
  };

  const logOut = () => {
    localStorage.removeItem('token');
    void message.success('退出登录成功');
    navigate('/login');
  };

  // const toMuxiSite = () => {
  //   window.location.href = 'https://muxi-tech.xyz';
  // };

  const items: MenuProps['items'] = [
    {
      label: (
        <div
          onClick={() => {
            navigationClick('/app/home');
          }}
        >
          个人主页
        </div>
      ),
      key: '/app/home',
    },
    {
      label: <div onClick={logOut}>退出登录</div>,
      key: 'logout',
    },
  ];

  //图标列表
  const imageIcons: Record<string, string> = {
    form: 'https://ossfresh-test.muxixyz.com/baomingbiao%404x%20%281%29.png',
    progress:
      'https://ossfresh-test.muxixyz.com/%E8%BF%9B%E5%BA%A6%E6%9F%A5%E8%AF%A2%404x.png',
    homework: 'https://ossfresh-test.muxixyz.com/%E5%AE%B9%E5%99%A8%404x%20%282%29.png',
    review: 'https://ossfresh-test.muxixyz.com/%E5%AE%A1%E9%98%85%404x.png',
    authority: 'https://ossfresh-test.muxixyz.com/%E5%AE%B9%E5%99%A8%404x%20%283%29.png',
  };

  const changeMenuKey = (value: string) => {
    console.log('value', value);

    if (selectedMenuKey != value) {
      setSelectedMenuKey(value);
    }
  };

  const menus: MenuProps['items'] = [
    {
      key: '/app/form',
      title: '报名表',
      label: (
        <div className="layoutLink" onClick={() => changeMenuKey('/app/form')}>
          <img src={imageIcons.form} alt="报名表" style={{ width: 20, marginRight: 4 }} />
          报名表
        </div>
      ),
    },
    {
      key: '/app/progress',
      title: '进度查询',
      label: (
        <div className="layoutLink" onClick={() => changeMenuKey('/app/progress')}>
          <img
            src={imageIcons.progress}
            alt="进度查询"
            style={{ width: 25, marginRight: 4 }}
          />
          进度查询
        </div>
      ),
    },
    isForm === '已交表'
      ? {
          key: '/app/homework',
          title: '作业',
          label: (
            <div className="layoutLink">
              <img
                src={imageIcons.homework}
                alt="作业"
                style={{ width: 25, marginRight: 4 }}
              />
              作业
            </div>
          ),
          children:
            identity === 'super_admin' || identity === 'admin'
              ? [
                  {
                    key: '/app/homework/admin/new',
                    title: '新作业',
                    label: (
                      <div
                        className={'layoutLinkTest'}
                        style={{ fontSize: '1vw' }}
                        onClick={() => changeMenuKey('/app/homework')}
                      >
                        新作业
                      </div>
                    ),
                  },
                  {
                    key: '/app/homework/admin/edit',
                    title: '修改作业',
                    label: (
                      <div
                        className={'layoutLinkTest'}
                        style={{ fontSize: '1vw' }}
                        onClick={() => changeMenuKey('/app/homework')}
                      >
                        修改作业
                      </div>
                    ),
                  },
                  {
                    key: '/app/homework/admin/browse',
                    title: '查看作业',
                    label: (
                      <div
                        className={'layoutLinkTest'}
                        style={{ fontSize: '1vw' }}
                        onClick={() => changeMenuKey('/app/homework')}
                      >
                        查看作业
                      </div>
                    ),
                  },
                ]
              : [
                  {
                    key: '/app/homework/user/submit',
                    title: '提交作业',
                    label: (
                      <div
                        className={'layoutLinkTest'}
                        style={{ fontSize: '1vw' }}
                        onClick={() => changeMenuKey('/app/homework')}
                      >
                        提交作业
                      </div>
                    ),
                  },
                ],
        }
      : {
          key: '/app/homework/visitor',
          title: '作业',
          label: <div className={'layoutLink'}>作业</div>,
        },
    identity === 'super_admin' || identity === 'admin'
      ? {
          key: '/app/review',
          title: '审阅',
          label: (
            <div
              className="layoutLink"
              onClick={() => changeMenuKey('/app/authority-manage')}
            >
              <img
                src={imageIcons.review}
                alt="审阅"
                style={{ width: 25, marginRight: 4 }}
              />
              审阅
            </div>
          ),
        }
      : null,
    identity === 'super_admin' || identity === 'admin'
      ? {
          key: '/app/authority-manage',
          title: '权限管理',
          label: (
            <div className="layoutLink">
              <img
                src={imageIcons.authority}
                alt="权限管理"
                style={{ width: 25, marginRight: 4 }}
              />
              权限管理
            </div>
          ),
        }
      : null,
  ];

  return (
    <div className={'layout'}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100vw',
          backgroundColor: '#ffffff',
          justifyContent: 'space-between',
          paddingLeft: 0,
        }}
      >
        <div className={'layoutLogoBox'}>
          <div className="layoutLogo">
            <img src={muxi_logo} alt="logo" />
            {/* <div>木犀官网</div> */}
          </div>
        </div>

        {/* <img src={} alt='logo'/> */}
        <Dropdown menu={{ items }} placement={'bottom'}>
          <Avatar src={avatar || defaultAvatar} size="large" alt="avatar" />
        </Dropdown>
      </Header>
      <Sider width={'10vw'}>
        <div className={'layoutSidebar'}>
          <ConfigProvider
            theme={{
              token: {
                colorBgContainer: '#ffb841',
              },
              components: {
                Menu: {
                  itemSelectedBg: '#ffaf24',
                  itemSelectedColor: '#fffacc',
                  itemColor: '#fffacc',
                  itemHeight: 60,
                },
              },
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menus}
              onSelect={(e) => {
                navigationClick(e.key);
              }}
              style={{ minWidth: 0, flex: 'auto', borderInlineEnd: 0 }}
            />
          </ConfigProvider>
        </div>
      </Sider>
      <Content>
        <div className={'layoutBox'}>
          <div className={'layoutContent'}>
            <Outlet></Outlet>
          </div>
        </div>
      </Content>
    </div>
  );
};

export default Layout;
