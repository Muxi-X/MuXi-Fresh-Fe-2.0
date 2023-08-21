import { useState, useEffect } from 'react';
import join from '../../assets/join.png';
import logo from '../../assets/muxilogo.png';
import './MobileSignUp.less';
import { Input, message } from 'antd';
import { FrownOutlined, SmileOutlined } from '@ant-design/icons';
import { post } from '../../fetch';
import { SendEmailResult, SignUpResult } from '../SignUp/SignUp';
import { useNavigate } from 'react-router-dom';

const MobileSignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

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
    const req = {
      email: email,
      type: 'register',
    };

    post('/auth/send-verification-code', req, false).then(
      (r: SendEmailResult) => {
        const { flag } = r.data;
        if (flag) {
          setIsSend(true);
        }
      },
      (e) => {
        console.log(e);
        void message.error('获取验证码失败，请重试');
      },
    );
  };

  const checkEmail = () => {
    const isEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-]{2,})+(.[a-zA-Z]{2,3})$/;
    setIsEmail(isEmail.test(email));
  };

  const checkPasswordFormat = () => {
    if (password.length < 6) {
      setIsPasswordFormat(false);
      void message.error('密码不能少于6位');
    } else {
      setIsPasswordFormat(true);
    }
  };

  const checkPasswordMatch = () => {
    if (password === checkPassword) {
      setIsPasswordMatch(true);
    } else {
      setIsPasswordMatch(false);
      void message.error('密码不一致');
    }
  };

  const signUp = () => {
    if (!isEmail || !isPasswordFormat || !isPasswordMatch) {
      void message.error('注册信息填写有误，请重试！');
      return;
    }

    const req = {
      email: email,
      password: password,
      verify_code: verifyCode,
    };

    post('/auth/register', req, false).then(
      (r: SignUpResult) => {
        const { code } = r;
        if (code === 0) {
          void message.success('注册成功！');
          localStorage.setItem('token', r.data.token);
          void post('/schedule/create', true);
          // 用已经声明好的navigate跳转到首页
        } else if (code === -1) {
          void message.error('出错了');
        }
      },
      (e) => {
        console.log(e);
        void message.error('注册失败，请重试');
      },
    );
  };

  return (
    <div className="mobileSignUp-wrap">
      <div className="header-box">
        <img src={join} alt="" />
      </div>
      <div className="form-box">
        <div className="form-title-box">
          <div className="logo-box">
            <img src={logo} alt="" />
          </div>
          <div className="team-name-box">木犀团队</div>
        </div>
        <div className="account-box">
          <Input
            className="input-field"
            prefix={isEmail ? <SmileOutlined /> : <FrownOutlined />}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
            onBlur={checkEmail}
            placeholder="请输入邮箱"
            status={!isEmail ? 'error' : ''}
          />
        </div>
        <div className="password-box">
          <Input.Password
            className="input-field"
            prefix={isPasswordFormat ? <SmileOutlined /> : <FrownOutlined />}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
            onBlur={checkPasswordFormat}
            placeholder="请输入密码"
            status={!isPasswordFormat ? 'error' : ''}
          />
        </div>
        <div className="check-password-box">
          <Input.Password
            className="input-field"
            prefix={isPasswordMatch ? <SmileOutlined /> : <FrownOutlined />}
            onChange={(e) => {
              setCheckPassword(e.target.value);
            }}
            onBlur={checkPasswordMatch}
            value={checkPassword}
            placeholder="请确认密码"
            status={!isPasswordMatch ? 'error' : ''}
          />
        </div>
        <div className="verification-code-box">
          <Input
            className="input-field"
            onChange={(e) => {
              setVerifyCode(e.target.value);
            }}
            value={verifyCode}
            placeholder="验证码"
          />
          {!isSend ? (
            <div className="get-verifyCode-btn" onClick={sendVerificationCode}>
              获取验证码
            </div>
          ) : (
            <div className="countdown-box">{`${countdown}s`}</div>
          )}
        </div>
        <div className="btn-box">
          <div className="signIn-btn" onClick={() => navigate('/login')}>
            登录
          </div>
          <div className="signUp-btn" onClick={signUp}>
            注册
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSignUp;