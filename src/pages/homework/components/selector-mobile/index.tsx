import React, { CSSProperties, useEffect, useState } from 'react';
import {
  backType,
  dataType,
  SelectorProps,
  userInfoType,
  formStatusType,
  formInfoType,
} from '../../types';
import { Avatar, Button, ConfigProvider, List, message, Popover } from 'antd';
import './index.less';
import { defData } from '../../utils/deData';
import { UserOutlined } from '@ant-design/icons';
import { get } from '../../../../fetch.ts';
import { useNavigate } from 'react-router-dom';

interface TopBarMobileProps {
  onChange?: (e: dataType) => void;
}
interface AvatarWrapProps {
  className?: string;
  style?: CSSProperties;
}
const TopBarMobile: React.FC<TopBarMobileProps> = (props) => {
  const { onChange } = props;
  return (
    <div className="top-bar-mobile">
      <AvatarWrap></AvatarWrap>
      <SelectorMobile data={defData} onChange={onChange}></SelectorMobile>
    </div>
  );
};
export default TopBarMobile;
export const AvatarWrap: React.FC<AvatarWrapProps> = (props) => {
  const [userInfo, setUserInfo] = useState<userInfoType>();
  useEffect(() => {
    get('/users/my-info').then((res: backType<userInfoType>) => {
      setUserInfo(res.data);
    }, null);
  }, []);
  const { className, style } = props;
  const renderText = (str: string) => {
    if (str?.length > 8) return str.slice(0, 8) + '...';
    return str;
  };
  return (
    <>
      <div className={`avatar-wrap ${className as string}`} style={style}>
        <Avatar
          className="top-bar-avatar"
          src={userInfo?.avatar}
          icon={<UserOutlined></UserOutlined>}
        ></Avatar>
        {renderText(userInfo?.name as string)}
      </div>
    </>
  );
};
const SelectorMobile: React.FC<SelectorProps> = (props) => {
  const { data, className, onChange } = props;
  const [open, setopen] = useState<boolean>(false);
  const [selected, setselected] = useState<dataType>(data[0]);
  const nav = useNavigate();
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    get('/form/judge').then((res: backType<formStatusType>) => {
      if (res.data.form_status == '已交表') {
        get('/form/view?entry_form_id=myself').then((res: backType<formInfoType>) => {
          const group = data.filter((item) => item.value === res.data.group)[0];
          setselected(group);
          onChange && onChange(group);
        }, null);
      } else {
        message.info('请先填写报名表').then(() => {
          nav('/app');
        }, null);
      }
    }, null);
  }, []);
  const handleClick = (e: dataType) => {
    onChange && onChange(e);
    setselected(e);
    setopen(!open);
  };
  const renderContent = (data: dataType[]) => {
    return data.map((item, index) => {
      return (
        <List.Item
          className="selector-mobile-item"
          key={`${item.value as string} ${index.toString(10)}`}
          onClick={() => handleClick(item)}
        >
          {item.key}
        </List.Item>
      );
    });
  };
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#eee',
        },
      }}
    >
      <div className={`selector-mobile-wrap ${className as string}`}>
        <Popover
          className="selector-mobile-popover"
          trigger={'click'}
          open={open}
          content={renderContent(data)}
        >
          <Button onClick={() => setopen(!open)} className="selector-mobile-button">
            {`${selected?.key}作业`}
            <img
              className="icon_2"
              src={'https://s2.loli.net/2023/08/31/JAK6Lyq9nWG2tBj.png'}
              alt={''}
            />
          </Button>
        </Popover>
      </div>
    </ConfigProvider>
  );
};
