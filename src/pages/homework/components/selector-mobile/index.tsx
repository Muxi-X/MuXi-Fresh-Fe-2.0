import React, { CSSProperties, useEffect, useState } from 'react';
import {
  backType,
  dataType,
  SelectorProps,
  UserInfoType,
  userInfoType,
} from '../../types';
import { Avatar, Button, ConfigProvider, List, Popover } from 'antd';
import './index.less';
import { defData } from '../../utils/deData';
import { UserOutlined } from '@ant-design/icons';
import { get } from '../../../../fetch.ts';

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
  const [userInfo, setuserInfo] = useState<UserInfoType>();
  useEffect(() => {
    get('/users/my-info').then((res: backType<userInfoType>) => {
      setuserInfo(res.data as UserInfoType);
    }, null);
  }, []);
  const renderText = (str: string) => {
    if (str?.length > 8) return str.slice(0, 8) + '...';
    return str;
  };
  return (
    <>
      <div className={`avatar-wrap ${props.className as string}`} style={props.style}>
        <Avatar
          className="top-bar-avatar"
          src={userInfo?.avatar}
          icon={<UserOutlined></UserOutlined>}
        ></Avatar>
        {renderText(userInfo?.nickname as string)}
      </div>
    </>
  );
};
const SelectorMobile: React.FC<SelectorProps> = (props) => {
  const { data, className, onChange } = props;
  const [open, setopen] = useState<boolean>(false);
  const [selected, setselected] = useState<dataType>(data[0]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    onChange && onChange(data[0]);
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
              src={
                'https://lanhu.oss-cn-beijing.aliyuncs.com/FigmaDDSSlicePNGd58be812f49ee63b0939d4f18beb0072.png'
              }
              alt={''}
            />
          </Button>
        </Popover>
      </div>
    </ConfigProvider>
  );
};