import React, { useEffect, useState } from 'react';
import './MobileProgress.less';
import { message, Spin, Steps } from 'antd';
import { get } from '../../fetch';
import { GetScheduleResult, Schedule } from '../Progress/Progress';
import { Group } from '../Review/ReviewFitler';
import { Step } from './MobileProgress';
import { useNavigate } from 'react-router-dom';

const MobileProgress: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule>({
    name: '',
    school: '',
    major: '',
    group: Group.Product,
    entry_form_status: '',
    admission_status: '',
  });

  const [step, setStep] = useState<Step>({
    current: 0,
    status: 'wait',
  });

  const [isLoading, setIsLoading] = useState(true);

  const chineseGroups: { [key in Group]: string } = {
    // Android: '安卓组',
    Backend: '后端组',
    Design: '设计组',
    Frontend: '前端组',
    Operation: '运营组',
    Product: '产品组',
  };

  useEffect(() => {
    void get(`/schedule/?schedule_id=${'myself'}`, true).then(
      (r: GetScheduleResult) => {
        if (r.code === 200) {
          setSchedule(r.data);
          setIsLoading(false);
          const { admission_status } = r.data;
          if (admission_status === '已报名') {
            setStep({
              current: 0,
              status: 'finish',
            });
          } else if (admission_status === '实习期') {
            setStep({
              current: 1,
              status: 'process',
            });
          } else if (admission_status === '已转正') {
            setStep({
              current: 2,
              status: 'finish',
            });
          }
        } else {
          void message.error('查询进度失败，请重试！');
        }
      },
      (e) => {
        console.error(e);
        void message.error('查询进度失败，请重试！');
      },
    );
  }, []);

  const navigate = useNavigate();
  const backToHome = () => {
    navigate(-1);
  };

  return (
    <div className="mobileProgress-wrap">
      <div className="header-box">
        <div className="back-btn-box" onClick={backToHome}>
          <img src={'https://muxi-fresh.muxixyz.com/fe-static/back.png'} alt="" />
        </div>
        <div className="title-box">进度查询</div>
      </div>
      <div className="content-box">
        <Steps
          className="step"
          current={step.current}
          status={step.status}
          responsive={false}
          direction="horizontal"
          items={[
            {
              title: '已报名',
              description: '',
            },
            {
              title: '实习期',
              description: '',
            },
            {
              title: '已转正',
              description: '',
            },
          ]}
        />
        <table className="progress-table" cellSpacing={0}>
          <thead>
            <tr>
              {/* <th className="table-title" colSpan={2}>
                木犀招新进度查询
              </th> */}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tr-title">姓名</td>
              {isLoading ? <Spin /> : <td className="tr-content">{schedule.name}</td>}
            </tr>
            <tr>
              <td className="tr-title">学院</td>
              {isLoading ? <Spin /> : <td className="tr-content">{schedule.school}</td>}
            </tr>
            <tr>
              <td className="tr-title">专业</td>
              {isLoading ? <Spin /> : <td className="tr-content">{schedule.major}</td>}
            </tr>
            <tr>
              <td className="tr-title">报名组别</td>
              {isLoading ? (
                <Spin />
              ) : (
                <td className="tr-content">{chineseGroups[schedule.group]}</td>
              )}
            </tr>
            <tr>
              <td className="tr-title">报名表状态</td>
              {isLoading ? (
                <Spin />
              ) : (
                <td className="tr-content">{schedule.entry_form_status}</td>
              )}
            </tr>
            <tr>
              <td className="tr-title">录取状态</td>
              {isLoading ? (
                <Spin />
              ) : (
                <td className="tr-content">{schedule.admission_status}</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MobileProgress;
