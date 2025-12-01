import React, { useEffect, useState } from 'react';
import { Input, message, Modal, Select, Spin, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import './Homepage.less';
import {
  ChangeEmailResult,
  ChangeUserInfoResult,
  GetQiniuTokenResult,
  GetUserInfoResult,
  UserInfo,
} from './UserInfo';
import { get, post } from '../../fetch';
import schoolData from './SchoolData';
import * as qiniu from 'qiniu-js';
import { SendEmailResult } from '../SignUp/SignUp';

const ShowInfo = ({ changeEditState }: { changeEditState: () => void }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatar: '',
    name: '',
    nickname: '',
    school: '',
    email: '',
    group: '',
    student_id: '',
    qq: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  useEffect(() => {
    void get('/users/my-info', true).then(
      (r: GetUserInfoResult) => {
        const { data } = r;
        setUserInfo(data);
        setIsLoading(false);
      },
      (e) => {
        console.error(e);
        void message.error('获取个人信息失败，请重试');
      },
    );
  }, []);

  const showEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  const changeEmail = () => {
    const req = {
      email: newEmail,
      verify_code: verifyCode,
    };
    void post('/auth/email', req, true).then(
      (r: ChangeEmailResult) => {
        if (r.code === 200) {
          const email = newEmail;
          setUserInfo({ ...userInfo, email });
          void (r.data.flag && message.success('邮箱绑定成功！'));
          setNewEmail('');
          setVerifyCode('');
        } else {
          void message.error('邮箱绑定失败，请重试！');
          setNewEmail('');
          setVerifyCode('');
        }
      },
      (e) => {
        console.error(e);
        void message.error('邮箱绑定失败，请重试！');
        setNewEmail('');
        setVerifyCode('');
      },
    );
    setIsEmailModalOpen(false);
  };

  const cancelEmailModal = () => {
    setIsEmailModalOpen(false);
    setNewEmail('');
    setVerifyCode('');
  };

  const sendVerificationCode = () => {
    const req = {
      email: newEmail,
      type: 'set_email',
    };

    post('/auth/send-verification-code', req, false).then(
      (r: SendEmailResult) => {
        const { flag } = r.data;
        if (flag) {
          void message.success('验证码已发送！');
          // setIsSend(true);
        }
      },
      (e) => {
        console.error(e);
        void message.error('获取验证码失败，请重试');
      },
    );
  };

  const showStudentIdModal = () => {
    setIsIdModalOpen(true);
  };

  const changeStudentId = () => {
    const req = {
      student_id: studentId,
      password: password,
    };
    void post('/auth/set-student-id', req, true).then(
      (r: ChangeUserInfoResult) => {
        if (r.code === 200) {
          const student_id = studentId;
          setUserInfo({ ...userInfo, student_id });
          void (r.data.flag && message.success('学号绑定成功！'));
          setStudentId('');
          setPassword('');
        } else {
          void message.error(`${r.msg}，请重试！`);
          setPassword('');
        }
      },
      (e) => {
        console.error(e);
        void message.error('学号绑定失败，请重试！');
        setPassword('');
      },
    );
    setIsIdModalOpen(false);
  };

  const cancelStudentIdModal = () => {
    setIsIdModalOpen(false);
    setStudentId('');
    setPassword('');
  };

  return (
    <>
      <div className="detail-info-box">
        <div className="name-box">
          <div className="box-title">姓名:</div>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="box-content">{userInfo.name || '待补充'}</div>
          )}
        </div>
        <div className="nickName-box">
          <div className="box-title">昵称:</div>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="box-content">{userInfo.nickname || '待补充'}</div>
          )}
        </div>
        <div className="college-box">
          <div className="box-title">学院:</div>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="box-content">{userInfo.school || '待补充'}</div>
          )}
        </div>
        <div className="group-box">
          <div className="box-title">组别:</div>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="box-content">{userInfo.group || '待补充'}</div>
          )}
        </div>
        <div className="account-box">
          <div className="box-title">学号:</div>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="box-content">{userInfo.student_id || '未绑定'}</div>
          )}
          <div className="change-btn" onClick={showStudentIdModal}>
            修改
          </div>
        </div>
        <div className="email-box">
          <div className="box-title">邮箱:</div>
          {isLoading ? <Spin /> : <div className="box-content">{userInfo.email}</div>}
          <div className="change-btn" onClick={showEmailModal}>
            修改
          </div>
        </div>
        <div className="qq-box">
          <div className="box-title">QQ:</div>
          {isLoading ? (
            <Spin />
          ) : (
            <div className="box-content">{userInfo.qq || '待补充'}</div>
          )}
        </div>
        <div className="change-info-btn" onClick={changeEditState}>
          修改
        </div>
      </div>
      <Modal
        className="email-modal"
        open={isEmailModalOpen}
        onOk={changeEmail}
        onCancel={cancelEmailModal}
        okText="确认"
        cancelText="取消"
      >
        <div className="email-box">
          <div className="box-label">新邮箱:</div>
          <Input
            className="input-field"
            onChange={(e) => setNewEmail(e.target.value)}
            value={newEmail}
            type="email"
            placeholder="请输入邮箱"
          />
        </div>
        <div className="verifyCode-box">
          <div className="box-label">验证码:</div>
          <Input
            className="input-field"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
          />
          <div className="get-verifyCode-btn" onClick={sendVerificationCode}>
            获取验证码
          </div>
        </div>
      </Modal>
      <Modal
        className="studentId-modal"
        open={isIdModalOpen}
        onOk={changeStudentId}
        onCancel={cancelStudentIdModal}
        okText="确认"
        cancelText="取消"
      >
        <div className="studentId-box">
          <div className="box-label">学号:</div>
          <Input
            className="input-field"
            onChange={(e) => setStudentId(e.target.value)}
            value={studentId}
            placeholder="请输入学号"
          />
        </div>
        <div className="password-box">
          <div className="box-label">密码:</div>
          <Input.Password
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入一站式密码"
          />
        </div>
      </Modal>
    </>
  );
};

const EditInfo = ({ changeEditState }: { changeEditState: () => void }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatar: '',
    name: '',
    nickname: '',
    school: '',
    email: '',
    group: '',
    student_id: '',
    qq: '',
  });

  const [newEmail, setNewEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  useEffect(() => {
    void get('/users/my-info', true).then(
      (r: GetUserInfoResult) => {
        const { data } = r;
        setUserInfo(data);
      },
      (e) => {
        console.error(e);
        void message.error('获取个人信息失败，请重试');
      },
    );
  }, []);

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setUserInfo({ ...userInfo, name });
  };

  const changeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nickname = e.target.value;
    setUserInfo({ ...userInfo, nickname });
  };

  const changeSchool = (value: string) => {
    const school = value;
    setUserInfo({ ...userInfo, school });
  };

  const changeGroup = (value: string) => {
    const group = value;
    setUserInfo({ ...userInfo, group });
  };

  const changeQQ = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qq = e.target.value;
    setUserInfo({ ...userInfo, qq });
  };

  const showEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  const changeEmail = () => {
    const req = {
      email: newEmail,
      verify_code: verifyCode,
    };
    void post('/auth/email', req, true).then(
      (r: ChangeEmailResult) => {
        if (r.code === 200) {
          const email = newEmail;
          setUserInfo({ ...userInfo, email });
          void (r.data.flag && message.success('邮箱绑定成功！'));
          setNewEmail('');
          setVerifyCode('');
        } else {
          void message.error('邮箱绑定失败，请重试！');
          setNewEmail('');
          setVerifyCode('');
        }
      },
      (e) => {
        console.error(e);
        void message.error('邮箱绑定失败，请重试！');
        setNewEmail('');
        setVerifyCode('');
      },
    );
    setIsEmailModalOpen(false);
  };

  const cancelEmailModal = () => {
    setIsEmailModalOpen(false);
    setNewEmail('');
    setVerifyCode('');
  };

  const sendVerificationCode = () => {
    const req = {
      email: newEmail,
      type: 'set_email',
    };

    post('/auth/send-verification-code', req, false).then(
      (r: SendEmailResult) => {
        const { flag } = r.data;
        if (flag) {
          void message.success('验证码已发送！');
          // setIsSend(true);
        }
      },
      (e) => {
        console.error(e);
        void message.error('获取验证码失败，请重试');
      },
    );
  };

  const showStudentIdModal = () => {
    setIsIdModalOpen(true);
  };

  const changeStudentId = () => {
    const req = {
      student_id: studentId,
      password: password,
    };
    void post('/auth/set-student-id', req, true).then(
      (r: ChangeUserInfoResult) => {
        if (r.code === 200) {
          const student_id = studentId;
          setUserInfo({ ...userInfo, student_id });
          void (r.data.flag && message.success('学号绑定成功！'));
          setStudentId('');
          setPassword('');
        } else {
          void message.error(`${r.msg}，请重试！`);
          setStudentId('');
          setPassword('');
        }
      },
      (e) => {
        console.error(e);
        void message.error('学号绑定失败，请重试！');
        setStudentId('');
        setPassword('');
      },
    );
    setIsIdModalOpen(false);
  };

  const cancelStudentIdModal = () => {
    setIsIdModalOpen(false);
    setStudentId('');
    setPassword('');
  };

  const submit = () => {
    const req = {
      avatar: userInfo.avatar,
      name: userInfo.name,
      nickname: userInfo.nickname,
      school: userInfo.school,
      qq: userInfo.qq,
    };

    void post('/users/', req, true).then(
      (r: ChangeUserInfoResult) => {
        if (r.code === 200) {
          void message.success('修改信息成功！');
          changeEditState();
        } else {
          void message.success('修改信息失败，请重试！');
        }
      },
      (e) => {
        console.error(e);
        void message.success('修改信息失败，请重试！');
      },
    );
  };

  return (
    <>
      <div className="detail-info-box-edit">
        <div className="name-box">
          <div className="box-title">姓名:</div>
          <Input
            className="box-content"
            onChange={(e) => changeName(e)}
            value={userInfo.name}
            placeholder="请补充姓名"
          />
        </div>
        <div className="nickName-box">
          <div className="box-title">昵称:</div>
          <Input
            className="box-content"
            onChange={(e) => changeNickname(e)}
            value={userInfo.nickname}
            placeholder="请补充昵称"
          />
        </div>
        <div className="college-box">
          <div className="box-title">学院:</div>
          <Select
            className="box-content"
            defaultValue={'计算机学院'}
            value={userInfo.school}
            options={schoolData}
            onChange={changeSchool}
          />
        </div>
        <div className="group-box">
          <div className="box-title">组别:</div>
          <Select
            className="box-content"
            defaultValue="请选择组别"
            value={userInfo.group}
            options={[
              { value: 'Product', label: '产品组' },
              { value: 'Design', label: '设计组' },
              { value: 'Frontend', label: '前端组' },
              { value: 'Backend', label: '后端组' },
            ]}
            onChange={changeGroup}
          />
        </div>
        <div className="account-box">
          <div className="box-title">学号:</div>
          <div className="box-content">{userInfo.student_id || '未绑定'}</div>
          <div className="change-btn" onClick={showStudentIdModal}>
            修改
          </div>
        </div>
        <div className="email-box">
          <div className="box-title">邮箱:</div>
          <div className="box-content">{userInfo.email}</div>
          <div className="change-btn" onClick={showEmailModal}>
            修改
          </div>
        </div>
        <div className="qq-box">
          <div className="box-title">QQ:</div>
          <Input
            className="box-content"
            onChange={(e) => changeQQ(e)}
            value={userInfo.qq}
            placeholder="请补充QQ"
          />
        </div>
        <div className="change-info-btn" onClick={submit}>
          确认修改
        </div>
      </div>
      <Modal
        className="email-modal"
        open={isEmailModalOpen}
        onOk={changeEmail}
        onCancel={cancelEmailModal}
        okText="确认"
        cancelText="取消"
      >
        <div className="email-box">
          <div className="box-label">新邮箱:</div>
          <Input
            className="input-field"
            onChange={(e) => setNewEmail(e.target.value)}
            value={newEmail}
            type="email"
            placeholder="请输入邮箱"
          />
        </div>
        <div className="verifyCode-box">
          <div className="box-label">验证码:</div>
          <Input
            className="input-field"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
          />
          <div className="get-verifyCode-btn" onClick={sendVerificationCode}>
            获取验证码
          </div>
        </div>
      </Modal>
      <Modal
        className="studentId-modal"
        open={isIdModalOpen}
        onOk={changeStudentId}
        onCancel={cancelStudentIdModal}
        okText="确认"
        cancelText="取消"
      >
        <div className="studentId-box">
          <div className="box-label">学号:</div>
          <Input
            className="input-field"
            onChange={(e) => setStudentId(e.target.value)}
            value={studentId}
            placeholder="请输入学号"
          />
        </div>
        <div className="password-box">
          <div className="box-label">密码:</div>
          <Input.Password
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入一站式密码"
          />
        </div>
      </Modal>
    </>
  );
};

const HomePage: React.FC = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [qiniuToken, setQiniuToken] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');

  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatar: '',
    name: '',
    nickname: '',
    school: '',
    email: '',
    group: '',
    student_id: '',
    qq: '',
  });

  useEffect(() => {
    void get('/users/my-info', true).then(
      (r: GetUserInfoResult) => {
        const { data } = r;
        setUserInfo(data);
      },
      (e) => {
        console.error(e);
        void message.error('获取个人信息失败，请重试');
      },
    );

    void get('/auth/get-qntoken', true).then((r: GetQiniuTokenResult) => {
      const { QiniuToken } = r.data;
      setQiniuToken(QiniuToken);
      const config = {
        useCdnDomain: true,
        region: qiniu.region.z2,
      };
      void qiniu.getUploadUrl(config, QiniuToken).then((r) => {
        setUploadUrl(r);
      });
    });
  }, []);

  interface ResponseType {
    key: string;
    hash: string;
  }

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps<ResponseType>['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const response = newFileList[0].response;
    console.log('response', response?.key);

    if (response) {
      const avatar = `https://ossfresh-test.muxixyz.com/${response.key}`;
      const req = {
        avatar: avatar,
        name: userInfo.name,
        nickname: userInfo.nickname,
        school: userInfo.school,
        qq: userInfo.qq,
      };
      setUserInfo({ ...userInfo, avatar });
      void post('/users/', req, true).then(
        (r: ChangeUserInfoResult) => {
          if (r.code === 200) {
            void message.success('更改成功！');
          } else {
            void message.error('更换头像失败，请重试！');
          }
        },
        (e) => {
          console.error(e);
          void message.error('更换头像失败，请重试！');
        },
      );
    }
  };

  const changeEditState = () => {
    setIsEdit((isEdit) => !isEdit);
  };

  return (
    <div className="homePage-wrap">
      <div className="homePage-header">个人主页</div>
      <div className="person-info-box">
        <div className="avatar-box">
          <ImgCrop>
            <Upload<ResponseType>
              action={uploadUrl}
              data={{ token: qiniuToken }}
              fileList={fileList}
              onChange={onChange}
              showUploadList={false}
              maxCount={1}
            >
              <div className="avatar">
                <img src={userInfo.avatar} alt="" />
              </div>
            </Upload>
          </ImgCrop>
          <ImgCrop>
            <Upload<ResponseType>
              action={uploadUrl}
              data={{ token: qiniuToken }}
              fileList={fileList}
              onChange={onChange}
              showUploadList={false}
              maxCount={1}
            >
              <div className="change-avatar-box">
                <div className="change-avatar-btn">更换头像</div>
              </div>
            </Upload>
          </ImgCrop>
        </div>
        {isEdit ? (
          <EditInfo changeEditState={changeEditState} />
        ) : (
          <ShowInfo changeEditState={changeEditState} />
        )}
      </div>
      <div className="flower-box">
        <div className="flower1">
          <img src={'https://muxi-fresh.muxixyz.com/fe-static/muxilogo.png'} alt="" />
        </div>
        <div className="flower2">
          <img src={'https://muxi-fresh.muxixyz.com/fe-static/muxilogo2.png'} alt="" />
        </div>
        <div className="flower3">
          <img src={'https://muxi-fresh.muxixyz.com/fe-static/muxilogo.png'} alt="" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
