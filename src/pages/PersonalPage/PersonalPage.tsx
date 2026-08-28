import React, { useEffect, useState } from 'react';
import './PersonalPage.less';
import { Input, message, Modal, Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import * as qiniu from 'qiniu-js';
import { get, post, postPwd } from '../../fetch';
import { buildUploadKey } from '../../utils/jwt';
import {
  ChangeEmailResult,
  ChangeUserInfoResult,
  GetQiniuTokenResult,
  GetUserInfoResult,
  UserInfo,
} from '../HomePage/UserInfo';
import { SendEmailResult } from '../SignUp/SignUp';
import { GetAuthSetPasswordResult } from './PersonalPage';
import { useNavigate } from 'react-router-dom';

const PersonalPage: React.FC = () => {
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

  const [newEmail, setNewEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [isSend, setIsSend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (isSend) {
      const timer = setTimeout(() => {
        if (countdown > 0) {
          setCountdown((countdown) => countdown - 1);
        } else {
          setIsSend(false);
          setCountdown(60);
          clearTimeout(timer);
        }
      }, 1000);
    }
  }, [countdown, isSend]);

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
          cancelEmailModal();
        } else {
          void message.error('邮箱绑定失败，请重试！');
          cancelEmailModal();
        }
      },
      (e) => {
        console.error(e);
        void message.error('邮箱绑定失败，请重试！');
        cancelEmailModal();
      },
    );
    setIsEmailModalOpen(false);
  };

  const cancelEmailModal = () => {
    setIsEmailModalOpen(false);
    setNewEmail('');
    setVerifyCode('');
    setIsSend(false);
    setCountdown(60);
  };

  const sendVerificationCode = (email: string, type: string) => {
    const req = {
      email: email,
      type: type,
    };

    post('/auth/send-verification-code', req, false).then(
      (r: SendEmailResult) => {
        const { flag } = r.data;
        if (flag) {
          void message.success('验证码已发送！');
          setIsSend(true);
        }
      },
      (e) => {
        console.error(e);
        void message.error('获取验证码失败，请重试');
      },
    );
  };

  const showPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const changePassword = () => {
    const req = {
      email: userInfo.email,
      verify_code: verifyCode,
    };
    void post('/auth/auth-set-password', req, true).then(
      (r: GetAuthSetPasswordResult) => {
        if (r.code === 200) {
          const { auth_set_password_token } = r.data;
          const data = {
            password: newPassword,
          };
          void postPwd('/auth/set-password', data, auth_set_password_token).then(
            (r: ChangeUserInfoResult) => {
              if (r.code === 200) {
                void message.success('修改密码成功！');
                cancelPasswordModal();
              } else {
                void message.error('修改密码失败，请重试！');
                cancelPasswordModal();
              }
            },
            (e) => {
              console.error(e);
              void message.error('修改密码失败，请重试！');
              cancelPasswordModal();
            },
          );
        } else {
          void message.error('验证码错误，请重试！');
          cancelPasswordModal();
        }
      },
      (e) => {
        console.error(e);
        void message.error('修改密码失败，请重试！');
        cancelPasswordModal();
      },
    );
  };

  const cancelPasswordModal = () => {
    setIsPasswordModalOpen(false);
    setVerifyCode('');
    setNewPassword('');
    setIsSend(false);
    setCountdown(60);
  };

  const navigate = useNavigate();
  const backToHome = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="personalPage-wrap">
        <div className="back-btn-box" onClick={backToHome}>
          <img src={'https://muxi-fresh.muxixyz.com/fe-static/back.png'} alt="" />
        </div>
        <div className="header-box">
          <div className="background-box">
            <img src={'https://muxi-fresh.muxixyz.com/fe-static/join.png'} alt="" />
          </div>
          <div className="title-box">个人主页</div>
        </div>
        <ImgCrop>
          <Upload<ResponseType>
            action={uploadUrl}
            data={(file) => ({
              token: qiniuToken,
              key: buildUploadKey(file.name),
            })}
            fileList={fileList}
            onChange={onChange}
            showUploadList={false}
            maxCount={1}
          >
            <div className="avatar-box">
              <img src={userInfo.avatar} alt="" />
            </div>
          </Upload>
        </ImgCrop>
        <div className="info-box1">
          <div className="nickname-box">{userInfo.nickname}</div>
          <div className="email-box">{userInfo.email}</div>
        </div>
        <div className="info-box2">
          <div className="info-box2-box1">
            <img
              className="box-logo"
              src={'https://muxi-fresh.muxixyz.com/fe-static/name.png'}
              alt=""
            />
            <div className="box-title">姓名学号</div>
            <div className="box-content">{`${userInfo.name} ${userInfo.student_id}`}</div>
          </div>
          <div className="info-box2-box2">
            <img
              className="box-logo"
              src={'https://muxi-fresh.muxixyz.com/fe-static/group.png'}
              alt=""
            />
            <div className="box-title">所在组别</div>
            <div className="box-content">{userInfo.group}</div>
          </div>
        </div>
        <div className="change-info-box">
          <div className="box-title">信息修改</div>
          <div className="change-studentId-box" onClick={showStudentIdModal}>
            <img
              className="box-logo"
              src={'https://muxi-fresh.muxixyz.com/fe-static/studentIdIcon.png'}
              alt=""
            />
            <div className="box-title">绑定/修改学号</div>
          </div>
          <div className="change-email-box" onClick={showEmailModal}>
            <img
              className="box-logo"
              src={'https://muxi-fresh.muxixyz.com/fe-static/emailIcon.png'}
              alt=""
            />
            <div className="box-title">修改邮箱</div>
          </div>
          <div className="change-password-box" onClick={showPasswordModal}>
            <img
              className="box-logo"
              src={'https://muxi-fresh.muxixyz.com/fe-static/passwordIcon.png'}
              alt=""
            />
            <div className="box-title">修改密码</div>
          </div>
        </div>
      </div>
      <Modal
        className="mobile-studentId-modal"
        open={isIdModalOpen}
        onOk={changeStudentId}
        onCancel={cancelStudentIdModal}
        okText="确认"
        cancelText="取消"
        centered
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
      <Modal
        className="mobile-email-modal"
        open={isEmailModalOpen}
        onOk={changeEmail}
        onCancel={cancelEmailModal}
        okText="确认"
        cancelText="取消"
        centered
      >
        <div className="email-box">
          <div className="box-label">邮箱:</div>
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
          {!isSend ? (
            <div
              className="get-verifyCode-btn"
              onClick={() => sendVerificationCode(newEmail, 'set_email')}
            >
              获取验证码
            </div>
          ) : (
            <div className="countdown-box">{`${countdown}s`}</div>
          )}
        </div>
      </Modal>
      <Modal
        className="mobile-password-modal"
        open={isPasswordModalOpen}
        onOk={changePassword}
        onCancel={cancelPasswordModal}
        okText="确认"
        cancelText="取消"
        centered
      >
        <div className="password-box">
          <div className="box-label">新密码:</div>
          <Input.Password
            className="input-field"
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
            placeholder="请输入新密码"
          />
        </div>
        <div className="verifyCode-box">
          <div className="box-label">验证码:</div>
          <Input
            className="input-field"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
          />
          {!isSend ? (
            <div
              className="get-verifyCode-btn"
              onClick={() => sendVerificationCode(userInfo.email, 'set_password')}
            >
              获取验证码
            </div>
          ) : (
            <div className="countdown-box">{`${countdown}s`}</div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PersonalPage;
