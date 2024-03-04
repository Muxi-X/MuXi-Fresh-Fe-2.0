import React, { useEffect, useState } from 'react';
import './index.less';
import { post, put, get } from '../../fetch';
import { message, Upload, Input, Radio, Select } from 'antd';
import ImgCrop from 'antd-img-crop';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import * as qiniu from 'qiniu-js';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../../utils/Debounce/debounce.ts';

const FormForMobile: React.FC = () => {
  const navigate = useNavigate();
  const [qiniuToken, setQiniuToken] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [pageNum, setPageNum] = useState(0); //页数
  const [name, setName] = useState(''); //姓名
  const [nickname, setnickname] = useState('');
  const [avatar2, setavatar2] = useState('');
  const [sex, setsex] = useState(''); //性别
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
  const [contactWayselect1, setcontactWayselect1] = useState('请选择'); //联系方式1
  const [contactWayselect2, setcontactWayselect2] = useState('选填'); //联系方式2
  const [reason, setreason] = useState(''); //心动原因
  const [knowledge, setknowledge] = useState(''); //组别了解
  const [wantGroup, setwantGroup] = useState(''); //心动组别
  const [self_intro, setself_intro] = useState(''); //自我介绍
  const [extra_question, setextra_question] = useState(''); //额外问题
  const [formSetted, setformSetted] = useState(false);
  const [form_id, setform_id] = useState('');
  const turnNext = () => {
    setPageNum(pageNum + 1); //换页函数
  };
  const backPage = () => {
    setPageNum(pageNum - 1); //换页函数
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
          if (data.code === 200) void message.success('提交成功^_^');
          else void message.error('提交失败');
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
    setTimeout(() => {
      navigate('/app');
    }, 1000);
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
        form_id: form_id,
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
          if (data.code === 200) void message.success('提交成功^_^');
          else void message.error('提交失败');
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
    setTimeout(() => {
      navigate('/app');
    }, 1000);
  };
  useEffect(() => {
    if (contactWayselect1 == 'email') void message.info('邮箱请在个人主页修改');
  }, [contactWayselect1]);
  useEffect(() => {
    if (contactWayselect2 == 'email') void message.info('邮箱请在个人主页修改');
  }, [contactWayselect2]);
  useEffect(() => {
    const formdata = get(`/form/view?entry_form_id=myself`);
    formdata
      .then((data: FormData) => {
        if (data.code == 200) {
          setformSetted(true);
          setavatar(data.data.avatar);
          setform_id(data.data.form_id);
          setsex(data.data.gender);
          setmajor(data.data.major);
          setgrade(data.data.grade);
          if (data.data.phone) {
            setcontactWayselect1('phone');
          }
          setcontactWay((pre) => ({ ...pre, ['phone']: data.data.phone }));
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
    const userdata = get(`/users/my-info`);
    userdata
      .then((data: User) => {
        setName(data.data.name);
        setstu_number(data.data.student_id);
        setnickname(data.data.nickname);
        setavatar2(data.data.avatar);
        setacademy(data.data.school);
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
      setavatar(avatar);
    }
  };

  const [isPastDeadline, setIsPastDeadline] = useState(false);

  useEffect(() => {
    // 获取当前日期和时间
    const currentDate = new Date();
    // 设置目标日期
    const targetDate = new Date(currentDate.getFullYear(), 4, 23, 59, 0); // 月份从0开始，所以8代表9月

    // 比较当前日期和目标日期
    if (currentDate > targetDate) {
      setIsPastDeadline(true);
      void message.warning('当前报名已截止');
    }
  }, []);

  const element: JSX.Element[] = [];
  element[0] = (
    <div className="page_formM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/back.png"
        className="returnBtn_formM"
        onClick={() => navigate('/app')}
      ></img>
      <div className="top_title_formM">报名表</div>
      <div className="details_formM formImg">完善你的简历</div>
      <div className="details_formM break_formM">让木犀团队更好地了解你吧</div>
      <div className="mainbox_formM firstbox_formM">
        <ImgCrop>
          <Upload<ResponseType>
            action={uploadUrl}
            data={{ token: qiniuToken }}
            fileList={fileList}
            onChange={onChange}
            showUploadList={false}
            maxCount={1}
          >
            <div className="avatar_formM">
              {avatar ? (
                <img src={avatar} />
              ) : (
                <img src="https://muxi-fresh.muxixyz.com/fe-static/avatarDefault.png"></img>
              )}
            </div>
          </Upload>
        </ImgCrop>
        <img
          src="https://muxi-fresh.muxixyz.com/fe-static/camera.png"
          alt=""
          className="cameraImg"
        />
        <div className="box_detail_formM">点击上传你的照片</div>
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">姓名</div>
        </div>
        <Input
          className="input_formM"
          placeholder="请输入你的真实姓名"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">性别</div>
        </div>
        <div className="sexbox_formM">
          <div
            className="sexboxleft male"
            onClick={() => {
              setsex('male');
            }}
            style={{
              backgroundColor: sex == 'male' ? '' : '#F5F5F5',
              border: sex == 'male' ? '2px solid #5858AF' : '2px solid  transparent',
            }}
          >
            <div className="enmale">Male</div>
            <div className="cnmale">男生</div>
          </div>
          {sex == 'male' ? (
            <img
              className="checkedImg"
              src="https://muxi-fresh.muxixyz.com/fe-static/checked.png"
            ></img>
          ) : (
            ''
          )}
        </div>
        <div className="sexbox_formM">
          <div
            className="sexboxleft female"
            onClick={() => {
              setsex('female');
            }}
            style={{
              backgroundColor: sex == 'female' ? '' : '#F5F5F5',
              border: sex == 'female' ? '2px solid #5858AF' : '2px solid  transparent',
            }}
          >
            <div className="enmale">Female</div>
            <div className="cnmale">女生</div>
          </div>
          {sex == 'female' ? (
            <img
              className="checkedImg"
              src="https://muxi-fresh.muxixyz.com/fe-static/checked.png"
            ></img>
          ) : (
            ''
          )}
        </div>
        <button
          className="change_next_formM"
          disabled={name && sex ? false : true}
          onClick={turnNext}
          style={
            name && sex
              ? { backgroundColor: '#FFC93F', color: '#413E55' }
              : { backgroundColor: '#DADADA', color: '#FFFFFF' }
          }
        >
          开始报名
        </button>
      </div>
    </div>
  );
  element[1] = (
    <div className="page_formM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/back.png"
        className="returnBtn_formM"
        onClick={backPage}
      ></img>
      <div className="top_title_formM">个人信息</div>
      <div className="mainbox_formM">
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">学号</div>
        </div>
        <Input
          disabled={true}
          className="input_formM"
          type="text"
          value={stu_number}
          onClick={() => void message.info('学号请在个人主页修改')}
        />
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">学院</div>
        </div>
        <Select
          id="schoolSelect_formM"
          style={{ width: '72vw' }}
          value={academy}
          size="large"
          onChange={(e) => setacademy(e)}
        >
          <Select.Option key="计算机学院" value="计算机学院">
            计算机学院
          </Select.Option>
          <Select.Option key="人工智能教育学部" value="人工智能教育学部">
            人工智能教育学部
          </Select.Option>
          <Select.Option key="心理学院" value="心理学院">
            心理学院
          </Select.Option>
          <Select.Option key="经济与工商管理学院" value="经济与工商管理学院">
            经济与工商管理学院
          </Select.Option>
          <Select.Option key="公共管理学院" value="公共管理学院">
            公共管理学院
          </Select.Option>
          <Select.Option key="信息管理学院" value="信息管理学院">
            信息管理学院
          </Select.Option>
          <Select.Option key="城市与环境科学学院" value="城市与环境科学学院">
            城市与环境科学学院
          </Select.Option>
          <Select.Option key="美术学院" value="美术学院">
            美术学院
          </Select.Option>
          <Select.Option key="新闻传播学院" value="新闻传播学院">
            新闻传播学院
          </Select.Option>
          <Select.Option key="政治与国际关系学院" value="政治与国际关系学院">
            政治与国际关系学院
          </Select.Option>
          <Select.Option key="教育学院" value="教育学院">
            教育学院
          </Select.Option>
          <Select.Option key="文学院" value="文学院">
            文学院
          </Select.Option>
          <Select.Option key="历史文化学院" value="历史文化学院">
            历史文化学院
          </Select.Option>
          <Select.Option key="马克思主义学院" value="马克思主义学院">
            马克思主义学院
          </Select.Option>
          <Select.Option key="法学院" value="法学院">
            法学院
          </Select.Option>
          <Select.Option key="社会学院" value="社会学院">
            社会学院
          </Select.Option>
          <Select.Option key="外国语学院" value="外国语学院">
            外国语学院
          </Select.Option>
          <Select.Option key="音乐学院" value="音乐学院">
            音乐学院
          </Select.Option>
          <Select.Option key="数学与统计学学院" value="数学与统计学学院">
            数学与统计学学院
          </Select.Option>
          <Select.Option key="物理科学与技术学院" value="物理科学与技术学院">
            物理科学与技术学院
          </Select.Option>
          <Select.Option key="化学学院" value="化学学院">
            化学学院
          </Select.Option>
          <Select.Option key="生命科学学院" value="生命科学学院">
            生命科学学院
          </Select.Option>
          <Select.Option key="体育学院" value="体育学院">
            体育学院
          </Select.Option>
        </Select>
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">专业</div>
        </div>
        <Input
          className="input_formM"
          placeholder="请输入你的专业"
          type="text"
          value={major}
          onChange={(e) => {
            setmajor(e.target.value);
          }}
        />
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">年级</div>
        </div>
        <Select
          id="GradeSelect_formM"
          value={grade}
          style={{ width: '72vw' }}
          size="large"
          onChange={(e) => setgrade(e)}
        >
          <Select.Option value="2023">2023</Select.Option>
          <Select.Option value="2022">2022</Select.Option>
          <Select.Option value="2021">2021</Select.Option>
          <Select.Option value="2020">2020</Select.Option>
          <Select.Option value="2019">2019</Select.Option>
          <Select.Option value="2018">2018</Select.Option>
          <Select.Option value="2017">2017</Select.Option>
          <Select.Option value="2016">2016</Select.Option>
        </Select>
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">联系方式</div>
        </div>
        <div className="contactWaybox_formM">
          <div className="contactWayterm_formM">
            <Select
              id="contactWayselect1_formM"
              value={contactWayselect1}
              style={{ width: '25vw' }}
              size="large"
              onChange={(e) => {
                setcontactWayselect1(e);
              }}
            >
              <Select.Option value="email" disabled={contactWayselect2 == 'email'}>
                邮箱
              </Select.Option>
              <Select.Option value="qq" disabled={contactWayselect2 == 'QQ'}>
                QQ
              </Select.Option>
              <Select.Option value="phone" disabled={contactWayselect2 == 'phone'}>
                手机
              </Select.Option>
            </Select>
            <Input
              type="text"
              className="contactContent_formM"
              placeholder="请输入"
              disabled={contactWayselect1 == 'email'}
              name={contactWayselect1}
              value={contactWay[contactWayselect1]}
              onChange={(e) =>
                setcontactWay((pre) => ({ ...pre, [e.target.name]: e.target.value }))
              }
            />
          </div>
          <div className="contactWayterm_formM">
            <Select
              id="contactWayselect2_formM"
              value={contactWayselect2}
              style={{ width: '25vw' }}
              size="large"
              onChange={(e) => setcontactWayselect2(e)}
            >
              <Select.Option value="email" disabled={contactWayselect1 == 'email'}>
                邮箱
              </Select.Option>
              <Select.Option value="qq" disabled={contactWayselect1 == 'QQ'}>
                QQ
              </Select.Option>
              <Select.Option value="phone" disabled={contactWayselect1 == 'phone'}>
                手机
              </Select.Option>
            </Select>
            <Input
              type="text"
              className="contactContent_formM"
              name={contactWayselect2}
              value={contactWay[contactWayselect2]}
              disabled={contactWayselect2 == 'email'}
              onChange={(e) =>
                setcontactWay((pre) => ({ ...pre, [e.target.name]: e.target.value }))
              }
            />
          </div>
        </div>
        <button className="change_next_formM" onClick={turnNext}>
          Next →
        </button>
      </div>
    </div>
  );
  element[2] = (
    <div className="page_formM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/back.png"
        className="returnBtn_formM"
        onClick={backPage}
      ></img>
      <div className="top_title_formM">报名信息</div>
      <img src="" alt="" />
      <div className="mainbox_formM">
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">心动组别</div>
        </div>
        <div className="groupSelectBox">
          <Select
            id="GroupSelect_formM"
            value={wantGroup}
            size="large"
            style={{ width: '27vw' }}
            onChange={(e) => setwantGroup(e)}
          >
            <Select.Option value="Product">产品组</Select.Option>
            <Select.Option value="Design">设计组</Select.Option>
            <Select.Option value="Frontend">前端组</Select.Option>
            <Select.Option value="Backend">后端组</Select.Option>
            <Select.Option value="Android">安卓组</Select.Option>
          </Select>
        </div>
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">心动理由</div>
        </div>
        <textarea
          maxLength={500}
          name=""
          id="group_reason_formM"
          placeholder="请输入你的理由"
          value={reason}
          onChange={(e) => setreason(e.target.value)}
        ></textarea>
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">对组别的认识</div>
        </div>
        <textarea
          maxLength={500}
          name=""
          id="group_know_formM"
          placeholder="请输入你对所选组别的了解"
          value={knowledge}
          onChange={(e) => setknowledge(e.target.value)}
        ></textarea>
        <button className="change_next_formM" onClick={turnNext}>
          Next →
        </button>
      </div>
    </div>
  );
  element[3] = (
    <div className="page_formM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/back.png"
        className="returnBtn_formM"
        onClick={backPage}
      ></img>
      <div className="top_title_formM">个人自述</div>
      <div className="mainbox_formM">
        <div className="self_tip">
          <span className="yellow">提示: </span>
          <span className="grey">
            进行一个自我介绍，内容需要包含自己的性格、能力、获得过的相关的成就以及假如自己进入木犀后的想法，可加入其他内容。
          </span>
        </div>
        <div className="term_detail_box_formM">
          <div className="yellowBot"></div>
          <div className="term_detail_formM">自我介绍</div>
        </div>
        <textarea
          maxLength={500}
          name=""
          id="self_introduction_formM"
          placeholder=" "
          value={self_intro}
          onChange={(e) => setself_intro(e.target.value)}
        ></textarea>
        <button className="change_next_formM" onClick={turnNext}>
          Next →
        </button>
      </div>
    </div>
  );
  element[4] = (
    <div className="page_formM">
      <img
        src="https://muxi-fresh.muxixyz.com/fe-static/back.png"
        className="returnBtn_formM"
        onClick={backPage}
      ></img>
      <img
        className="muxiplanet"
        src="https://muxi-fresh.muxixyz.com/fe-static/MuXi.png"
        alt=""
      />
      <div className="top_title_formM">小问题</div>
      <div className="mainbox_formM lastbox_formM">
        <div className="questionbox_formM">
          <span
            className="yellowBot"
            style={{ display: 'inline-block', marginLeft: '6vw', marginRight: '3vw' }}
          ></span>
          <span className="question_formM">
            你是否有加入/正在加入一些其他组织或担任学生工作
          </span>
        </div>
        <div className="answerbox_formM">
          <Radio.Group
            onChange={(e) => setextra_question(e.target.value as string)}
            value={extra_question}
          >
            <Radio value={'Y'}>是</Radio>
            <Radio value={'N'}>否</Radio>
          </Radio.Group>
        </div>

        <button
          className="change_next_formM"
          onClick={
            isPastDeadline
              ? () => {
                  void message.warning('当前报名已截止');
                }
              : formSetted
              ? debounce(changeForm, 400)
              : debounce(setForm, 400)
          }
        >
          提交报名表
        </button>
      </div>
    </div>
  );

  return <div>{element[pageNum]}</div>;
};
export default FormForMobile;
