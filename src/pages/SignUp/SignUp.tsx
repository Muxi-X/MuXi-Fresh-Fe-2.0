import React, { useEffect, useState } from 'react';
import { Input, message } from 'antd';
import './SignUp.less';
import { get, post } from '../../fetch';
import { SendEmailResult, SignUpResult } from './SignUp';
import { useNavigate } from 'react-router-dom';

const EMAIL_REGEX =
  /^[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/;

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [VerifyCode, setVerifyCode] = useState('');

  const [isEmail, setIsEmail] = useState(true);
  const [isPasswordFormat, setIsPasswordFormat] = useState(true);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isSend, setIsSend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const navigate = useNavigate();

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

  const sendVerificationCode = () => {
    if (!email) {
      void message.error('请输入邮箱');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      void message.error('请输入正确的邮箱地址');
      return;
    }

    const req = {
      email: email,
      type: 'register',
    };

    post('/auth/send-verification-code', req, false).then(
      (r: SendEmailResult) => {
        const { code } = r;
        if (code === 200) {
          setIsSend(true);
          void message.success('验证码已发送！');
        } else {
          void message.error(`${r.msg}，请重试！`);
        }
      },
      (e) => {
        console.error(e);
        void message.error('获取验证码失败，请重试');
      },
    );
  };

  const checkEmail = () => {
    setIsEmail(EMAIL_REGEX.test(email));
  };

  const checkPasswordFormat = () => {
    if (password.length < 6) {
      setIsPasswordFormat(false);
    } else {
      setIsPasswordFormat(true);
    }
  };

  const checkPasswordMatch = () => {
    if (password === checkPassword) {
      setIsPasswordMatch(true);
    } else {
      setIsPasswordMatch(false);
    }
  };

  const submit = () => {
    if (!isEmail || !isPasswordFormat || !isPasswordMatch) {
      void message.error('注册信息填写有误，请重试！');
      return;
    }

    const req = {
      email: email,
      password: password,
      verify_code: VerifyCode,
    };

    post('/auth/register', req, false).then(
      (r: SignUpResult) => {
        const { code } = r;
        if (code === 200) {
          void message.success('注册成功！');
          localStorage.setItem('token', r.data.token);
          void get('/schedule/create', true);
          navigate('/app');
        } else {
          void message.error(`${r.msg}，请重试！`);
        }
      },
      (e) => {
        console.error(e);
        void message.error('注册失败，请重试');
      },
    );
  };

  return (
    <>
      <div className="signUp-box">
        <div className="signUp-wrap">
          <div className="signUp-img-box">
            <img
              className="signUp-background"
              src={'https://muxi-fresh.muxixyz.com/fe-static/signInImg.png'}
              alt=""
            />
            <div className="logo-box1">
              <img
                src={'https://ossfresh-test.muxixyz.com/%E7%BB%84%208%402x.png'}
                alt=""
              />
            </div>
            <div className="logo-box2">
              <img
                src={'https://ossfresh-test.muxixyz.com/%E7%BB%84%209%402x.png'}
                alt=""
              />
            </div>
            <div className="logo-box3">
              <img
                src={'https://ossfresh-test.muxixyz.com/%E7%BB%84%2011%402x.png'}
                alt=""
              />
            </div>
            <div className="logo-box4">
              <img
                src={'https://ossfresh-test.muxixyz.com/%E7%BB%84%2012%402x.png'}
                alt=""
              />
            </div>
            <div className="logo-text">
              <img
                src={'https://ossfresh-test.muxixyz.com/MUXI%20STUDIO%404x.png'}
                alt=""
              />
            </div>
          </div>
          <div className="signUp-form">
            <div className="email-box">
              <div className="box-label">邮箱:</div>
              <Input
                className="input-field"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                onBlur={checkEmail}
                value={email}
                status={!isEmail ? 'error' : ''}
              />
            </div>
            <div className="verifyCode-box">
              <div className="box-label">验证码:</div>
              <Input
                className="input-field"
                onChange={(e) => {
                  setVerifyCode(e.target.value);
                }}
                value={VerifyCode}
              />
              {!isSend ? (
                <div className="get-verifyCode-btn" onClick={sendVerificationCode}>
                  获取验证码
                </div>
              ) : (
                <div className="countdown-box">{`${countdown}s`}</div>
              )}
            </div>
            <div className="password-box">
              <div className="box-label">密码:</div>
              <Input.Password
                className="input-field"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                value={password}
                onBlur={checkPasswordFormat}
              />
            </div>
            <div className="check-password-box">
              <div className="box-label">确认密码:</div>
              <Input.Password
                className="input-field"
                onChange={(e) => {
                  setCheckPassword(e.target.value);
                }}
                value={checkPassword}
                onBlur={checkPasswordMatch}
              />
            </div>

            <div className="btn-box">
              <div className="signUp-btn" onClick={submit}>
                注册
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
