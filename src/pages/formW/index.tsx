import React, { useEffect, useMemo, useState } from 'react';
import { get, put, post } from '../../fetch';
import { buildUploadKey } from '../../utils/jwt';
import './index.less';
import { ConfigProvider, message, Radio, Tooltip, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import * as qiniu from 'qiniu-js';
import { Watermark, Input, Select, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useParams } from 'react-router-dom';
import { debounce } from '../../utils/Debounce/debounce.ts';
import { getYear } from '../../utils/GetYearSeason/getFormYear.ts';
import { grader } from '../../utils/grader/grader.ts';

const FormForWeb: React.FC = () => {
  const { form_id } = useParams();
  const { user_id } = useParams();
  const [qiniuToken, setQiniuToken] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [name, setName] = useState(''); //姓名
  const [sex, setsex] = useState(''); //性别
  const [nickname, setnickname] = useState('');
  const [avatar2, setavatar2] = useState('');
  const [avatar, setavatar] = useState<string | undefined>('');
  const [stu_number, setstu_number] = useState(''); //学号
  const [academy, setacademy] = useState(''); //学院
  const [major, setmajor] = useState(''); //专业
  const [grade, setgrade] = useState(''); //年级
  const [contactWay, setcontactWay] = useState<{ [key: string]: string }>({
    email: '',
    qq: '',
    phone: '',
  }); //联系方式内容
  const [contactWayselect1, setcontactWayselect1] = useState('手机'); //联系方式1
  const [contactWayselect2, setcontactWayselect2] = useState('邮箱'); //联系方式2
  const [reason, setreason] = useState(''); //心动原因
  const [knowledge, setknowledge] = useState(''); //组别了解
  const [wantGroup, setwantGroup] = useState(''); //心动组别
  const [self_intro, setself_intro] = useState(''); //自我介绍
  const [extra_question, setextra_question] = useState(''); //额外问题
  const [formSetted, setformSetted] = useState(false);
  const [form_id_self, setform_id_self] = useState('');
  const chineseDict: { [key: string]: string } = {
    male: '男生',
    female: '女生',
    // Android: '安卓组',
    Backend: '后端组',
    Design: '设计组',
    Frontend: '前端组',
    Product: '产品组',
  };

  interface FormData {
    code: number;
    data: {
      avatar: string;
      extra_question: string;
      gender: string;
      grade: string;
      group: string;
      knowledge: string;
      major: string;
      phone: string;
      reason: string;
      self_intro: string;
      form_id: string;
    };
  }

  interface User {
    code: number;
    data: {
      avatar: string;
      email: string;
      group: string;
      name: string;
      nickname: string;
      qq: string;
      school: string;
      student_id: string;
    };
  }

  interface GetQiniuTokenResult {
    code: number;
    msg: 'OK';
    data: {
      QiniuToken: string;
    };
  }

  interface res {
    code: number;
  }

  const setForm = () => {
    const arr = [
      name,
      sex,
      grade,
      major,
      academy,
      wantGroup,
      reason,
      knowledge,
      self_intro,
      extra_question,
      avatar,
    ];
    const arrCN = [
      '请输入姓名',
      '请选择性别',
      '请输入年级',
      '请输入专业',
      '请选择学院',
      '请选择心动组别',
      '请输入心动理由',
      '请输入对组别了解',
      '请填写自我介绍',
      '请回答额外问题',
      '请上传证件照',
    ];
    const send = () => {
      post(`/form/`, {
        form_id: form_id_self,
        avatar: avatar,
        major: major,
        grade: grade,
        gender: sex,
        phone: contactWay['phone'],
        group: wantGroup,
        reason: reason,
        knowledge: knowledge,
        self_intro: self_intro,
        extra_question: extra_question,
      })
        .then((data: res) => {
          if (data.code === 200) {
            void message.success('提交成功^_^');
            setformSetted(true);
          } else {
            void message.error('提交失败');
          }
        })
        .catch((e) => {
          console.error(e);
        });
      post('/users/', {
        avatar: avatar2,
        name: name,
        nickname: nickname,
        qq: contactWay['qq'],
        school: academy,
      }).catch((e) => {
        console.error(e);
      });
    };
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === '') {
        void message.info(arrCN[i]);
        return;
      }
      if (contactWay['qq'] == '' && contactWay['phone'] == '') {
        void message.info('请至少输入QQ或手机中的一项');
        return;
      }
    }
    send();
  };
  const changeForm = () => {
    const arr = [
      name,
      sex,
      grade,
      major,
      academy,
      wantGroup,
      reason,
      knowledge,
      self_intro,
      extra_question,
    ];
    const arrCN = [
      '请输入姓名',
      '请选择性别',
      '请输入年级',
      '请输入专业',
      '请选择学院',
      '请选择心动组别',
      '请输入心动理由',
      '请输入对组别了解',
      '请填写自我介绍',
      '请回答额外问题',
    ];
    const send = () => {
      put(`/form/`, {
        form_id: form_id_self,
        avatar: avatar,
        major: major,
        grade: grade,
        gender: sex,
        phone: contactWay['phone'],
        group: wantGroup,
        reason: reason,
        knowledge: knowledge,
        self_intro: self_intro,
        extra_question: extra_question,
      })
        .then((data: res) => {
          if (data.code === 200) {
            void message.success('修改成功^_^');
            setformSetted(false);
          } else {
            void message.error('修改失败');
          }
        })
        .catch((e) => {
          console.error(e);
        });
      post('/users/', {
        avatar: avatar2,
        name: name,
        nickname: nickname,
        qq: contactWay['qq'],
        school: academy,
      }).catch((e) => {
        console.error(e);
      });
    };
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === '') {
        void message.info(arrCN[i]);
        return;
      }
      if (contactWay['qq'] == '' && contactWay['phone'] == '') {
        void message.info('请至少输入QQ或手机中的一项');
        return;
      }
    }
    send();
  };
  useEffect(() => {
    const formdata = get(`/form/view?entry_form_id=${form_id ? form_id : 'myself'}`);
    formdata
      .then((data: FormData) => {
        if (data.code == 200) {
          setformSetted(true);
          setavatar(data.data.avatar);
          setform_id_self(data.data.form_id);
          setsex(data.data.gender);
          setmajor(data.data.major);
          setgrade(data.data.grade);
          if (data.data.phone) {
            setcontactWayselect1('phone');
          }
          setcontactWay((pre) => ({ ...pre, ['phone']: data.data.phone}));
          setwantGroup(data.data.group);
          setreason(data.data.reason);
          setknowledge(data.data.knowledge);
          setself_intro(data.data.self_intro);
          setextra_question(data.data.extra_question);
        }
      })
      .catch((e) => {
        console.error(e);
      });
    const userdata = get(`/users/${user_id ? `info/${user_id}` : `my-info`}`);
    userdata
      .then((data: User) => {
        setName(data.data.name);
        setstu_number(data.data.student_id);
        setnickname(data.data.nickname);
        setavatar2(data.data.avatar);
        setacademy(data.data.school);
        if(data.data.email){
          setcontactWayselect2('email');
        }
        if (data.data.qq) {
          setcontactWayselect2('qq');
        }
        
        setcontactWay((pre) => ({
          ...pre,
          ['qq']: data.data.qq,
          ['email']: data.data.email,
        }));
      })
      .catch((e) => {
        console.error(e);
      });
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
  }, [form_id, user_id]);

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
      setavatar(avatar);
    }
  };
  useEffect(() => {
    if (contactWayselect1 == 'email' && !user_id)
      void message.info('邮箱请在个人主页修改');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactWayselect1]);
  useEffect(() => {
    if (contactWayselect2 == 'email' && !user_id)
      void message.info('邮箱请在个人主页修改');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactWayselect2]);
  const [isPastDeadline, setIsPastDeadline] = useState(false);

  useEffect(() => {
    // 获取当前日期和时间
    const currentDate = new Date();
    // 设置目标日期为9月23日23点59分
    const targetDate = new Date(currentDate.getFullYear(), 8, 26, 23, 59, 0); // 月份从0开始，所以8代表9月

    // 比较当前日期和目标日期
    if (currentDate > targetDate) {
      setIsPastDeadline(true);
      void message.warning('未在报名时间内');
    }
  }, []);

  const options = [
    {
      value: 'Product',
      label: '产品组',
      content: '引领头脑风暴，洞察市场需求，掌舵团队运营',
    },
    {
      value: 'Design',
      label: '设计组',
      content: '以美学之名，精雕细琢，呈现精美严谨的交互界面',
    },
    {
      value: 'Frontend',
      label: '前端组',
      content: '基于浏览器内核开发跨平台、跨终端的应用软件',
    },
    {
      value: 'Backend',
      label: '后端组',
      content: '后端服务、服务器运维、保障木犀产品长治久安',
    },
    // { value: 'Android', label: '安卓组' },
  ];

  const years = useMemo(() => getYear(), []);
  const graders = useMemo(() => grader(), []);

  return (
    <div className="FormWebpage">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#ffb841',
          },
        }}
      >
        <Watermark
          font={{ fontWeight: 200 }}
          content="MUXI-STUDIO"
          style={{ width: '100%' }}
        >
          <div className="FromForWeb">
            <div className="title_formweb">个人信息</div>
            <div className="personInformationbox">
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
                  disabled={form_id ? true : false}
                >
                  <div className="avatar_formweb">
                    {avatar ? (
                      <img src={avatar} alt={''} />
                    ) : (
                      <div className="avatarDefault">
                        <div style={{ fontSize: '20px' }}>+</div>
                        <div>上传证件照</div>
                      </div>
                    )}
                  </div>
                </Upload>
              </ImgCrop>
              <div className="personInfoContent">
                <div className="term_formweb">
                  <div className="detail_formweb">姓名:</div>
                  <Input
                    readOnly={form_id ? true : false}
                    className="input_formweb"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
                <div className="term_formweb">
                  <div className="detail_formweb">性别:</div>
                  {form_id ? (
                    <Input
                      className="select_formweb"
                      value={chineseDict[sex] ? chineseDict[sex] : sex}
                      readOnly={true}
                    ></Input>
                  ) : (
                    <Space wrap>
                      <Select
                        size="large"
                        className="select_formweb"
                        defaultValue=""
                        value={sex}
                        onChange={(e) => setsex(e)}
                        options={[
                          { value: 'male', label: '男生' },
                          { value: 'female', label: '女生' },
                        ]}
                      />
                    </Space>
                  )}
                </div>
              </div>
              <div className="personInfoContent">
                <div className="term_formweb">
                  <div className="detail_formweb">学号:</div>
                  <Input
                    // disabled={true}
                    className="input_formweb"
                    type="text"
                    value={stu_number}
                    onClick={() => {
                      if (!form_id) void message.info('学号请在个人主页修改');
                    }}
                  />
                </div>
                <div className="term_formweb">
                  <div className="detail_formweb">年级:</div>
                  {form_id ? (
                    <Input
                      className="select_formweb"
                      value={grade}
                      readOnly={true}
                    ></Input>
                  ) : (
                    <Space wrap>
                      <Select
                        disabled={form_id ? true : false}
                        size="large"
                        className="select_formweb"
                        defaultValue="大一"
                        value={grade}
                        onChange={(e) => setgrade(e)}
                        options={years}
                      />
                    </Space>
                  )}
                </div>
              </div>
              <div className="personInfoContent">
                <div className="term_formweb">
                  <div className="detail_formweb">学院:</div>
                  {form_id ? (
                    <Input
                      className="select_formweb"
                      value={academy}
                      readOnly={true}
                      style={{ width: '180px' }}
                    ></Input>
                  ) : (
                    <Space wrap>
                      <Select
                        disabled={form_id ? true : false}
                        size="large"
                        id="academy"
                        defaultValue=""
                        style={{ width: '180px' }}
                        value={academy}
                        onChange={(e) => setacademy(e)}
                        className="select_formweb"
                        options={graders}
                      />
                    </Space>
                  )}
                </div>
                <div className="term_formweb">
                  <div className="detail_formweb">专业:</div>
                  <Input
                    readOnly={form_id ? true : false}
                    type="text"
                    className="input_formweb"
                    value={major}
                    style={{ width: '180px' }}
                    onChange={(e) => {
                      setmajor(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="personInfoContent">
                <div className="contactWayterm">
                  <Space wrap>
                    <Select
                      style={{ width: '120px', textAlign: 'center' }}
                      value={contactWayselect1}
                      onChange={(value) => setcontactWayselect1(value)}
                      options={[
                        {
                          value: 'email',
                          label: '邮箱',
                          disabled: contactWayselect2 == 'email',
                        },
                        { value: 'qq', label: 'QQ', disabled: contactWayselect2 == 'qq' },
                        {
                          value: 'phone',
                          label: '手机',
                          disabled: contactWayselect2 == 'phone',
                        },
                      ]}
                    />
                  </Space>
                  <Input
                    disabled={contactWayselect1 == 'email'}
                    readOnly={form_id ? true : false}
                    style={{ width: '180px' }}
                    type="text"
                    className="contactContent input_formweb"
                    name={contactWayselect1}
                    value={contactWay[contactWayselect1]}
                    onChange={(e) =>
                      setcontactWay((pre) => ({
                        ...pre,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="contactWayterm">
                  <Space wrap>
                    <Select
                      style={{ width: '120px', textAlign: 'center' }}
                      value={contactWayselect2}
                      onChange={(value) => setcontactWayselect2(value)}
                      options={[
                        {
                          value: 'email',
                          label: '邮箱',
                          disabled: contactWayselect1 == 'email',
                        },
                        { value: 'qq', label: 'QQ', disabled: contactWayselect1 == 'qq' },
                        {
                          value: 'phone',
                          label: '手机',
                          disabled: contactWayselect1 == 'phone',
                        },
                      ]}
                    />
                  </Space>
                  <Input
                    disabled={contactWayselect2 == 'email'}
                    readOnly={form_id ? true : false}
                    style={{ width: '180px' }}
                    type="text"
                    className="contactContent input_formweb"
                    name={contactWayselect2}
                    value={contactWay[contactWayselect2]}
                    onChange={(e) =>
                      setcontactWay((pre) => ({
                        ...pre,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="title_formweb">报名信息</div>
            <div className="registerInformationbox">
              <div className="term_formweb wantGroup">
                <div className="detail_formweb">心动组别:</div>
                {form_id ? (
                  <Input
                    className="select_formweb"
                    value={chineseDict[wantGroup]}
                    readOnly={true}
                  />
                ) : (
                  <Space wrap>
                    <Select
                      disabled={form_id ? true : false}
                      style={{ width: '120px', textAlign: 'center' }}
                      id="GroupSelect"
                      value={wantGroup}
                      onChange={(e) => setwantGroup(e)}
                      options={options.map((option) => ({
                        value: option.value,
                        label: (
                          <Tooltip
                            overlayInnerStyle={{
                              boxShadow: 'none', // 移除 Tooltip 自带的阴影
                              border: 'none', // 移除 Tooltip 自带的边框
                              backgroundColor: 'white', // 设置 Tooltip 的背景色
                            }}
                            arrow={false} // 隐藏箭头
                            title={
                              <div
                                style={{
                                  width: '250px',
                                  backgroundColor: 'white', // 设置背景为白色
                                  padding: '10px', // 添加内边距使内容不贴边
                                  borderRadius: '4px', // 添加圆角
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // 添加阴影使其更明显
                                }}
                              >
                                <strong
                                  style={{
                                    display: 'block',
                                    textAlign: 'center', // 设置标题居中
                                    color: 'grey',
                                  }}
                                >
                                  {option.label}
                                </strong>
                                <div
                                  style={{
                                    maxWidth: '250px', // 设置 Tooltip 最大宽度
                                    whiteSpace: 'pre-wrap', // 允许跨行显示
                                    overflowY: 'auto', // 使内容可滚动
                                    maxHeight: '100px', // 限制 Tooltip 最大高度
                                    color: 'grey',
                                  }}
                                >
                                  {option.content}
                                </div>
                              </div>
                            }
                            placement="right"
                          >
                            <div>{option.label}</div>
                          </Tooltip>
                        ),
                      }))}
                    />
                  </Space>
                )}
              </div>

              <div className="reasonbox">
                <div className="detail_formweb">心动理由:</div>
                <TextArea
                  readOnly={form_id ? true : false}
                  maxLength={500}
                  style={{ resize: 'none' }}
                  className="textarea_formweb"
                  name=""
                  id="group_reason"
                  placeholder="请输入你的心动理由"
                  value={reason}
                  onChange={(e) => setreason(e.target.value)}
                ></TextArea>
              </div>
              <div className="knowledgebox">
                <div className="detail_formweb">对组别的认识:</div>
                <TextArea
                  readOnly={form_id ? true : false}
                  maxLength={500}
                  style={{ resize: 'none' }}
                  className="textarea_formweb"
                  name=""
                  id="group_knowledge"
                  placeholder="请输入你对所选组别的了解"
                  value={knowledge}
                  onChange={(e) => setknowledge(e.target.value)}
                ></TextArea>
              </div>
              <div className="self_introbox">
                <div className="detail_formweb">自我介绍:</div>
                <TextArea
                  readOnly={form_id ? true : false}
                  style={{ resize: 'none' }}
                  maxLength={500}
                  className="textarea_formweb"
                  name=""
                  id="self_inro"
                  placeholder="进行一个自我介绍，内容需要包含自己的性格、能力、获得过的相关的成就以及假如自己进入木犀后的想法，可加入其他内容。"
                  value={self_intro}
                  onChange={(e) => setself_intro(e.target.value)}
                ></TextArea>
              </div>
              <div className="questionbox_formweb">
                你是否有加入/正在加入一些其他组织或担任学生工作?
                <div className="answerbox_formweb">
                  <Radio.Group
                    disabled={form_id ? true : false}
                    buttonStyle="solid"
                    onChange={(e) => setextra_question(e.target.value as string)}
                    value={extra_question}
                    className="answer-radio"
                  >
                    <Radio value={'Y'}>是</Radio>
                    <Radio value={'N'}>否</Radio>
                  </Radio.Group>
                </div>
                <div className="send_formweb-box">
                  <div
                    style={{ display: form_id ? 'none' : '' }}
                    className="send_formweb"
                    onClick={
                      isPastDeadline
                        ? () => {
                            void message.warning('未在报名时间内');
                          }
                        : formSetted
                        ? debounce(changeForm, 400)
                        : debounce(setForm, 400)
                    }
                  >
                    {formSetted ? '完成修改' : '提交表格'}
                  </div>
                </div>
                <div className="alert-text">
                  在报名表提交截止时间之前，再次提交报名表可覆盖前一次报名表
                </div>
              </div>
            </div>
          </div>
        </Watermark>
      </ConfigProvider>
    </div>
  );
};

export default FormForWeb;
