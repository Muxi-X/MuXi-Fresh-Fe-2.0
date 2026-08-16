import React, { useEffect, useState } from 'react';
import './index.less';
import PageWrapMobile from '../../../components/pageWrap-mobile';
import TopBarMobile from '../../../components/selector-mobile';
import {
  backType,
  dataType,
  statusType,
  TaskInfoType,
  taskListType,
  titleListType,
  userTaskType,
} from '../../../types';
import { get } from '../../../../../fetch.ts';
import { ConfigProvider } from 'antd';
import SubmitBeforeJudge from './submitBeforeJudge.tsx';
import SubmitJudged from './submitJudged.tsx';
import { DropDownPure } from '../../../components/dropDown';

const HomeworkUserSubmitMobile: React.FC = () => {
  const [selected, setSelected] = useState<dataType>();
  const [judged, setJudged] = useState<boolean>(false);
  const [SubmissionID, setSubmissionID] = useState<string>('');
  const [currentTaskInfo, setCurrentTaskInfo] = useState<TaskInfoType>();
  const [currentTaskID, setCurrentTaskID] = useState<string>();
  const [uploadHistory, setUploadHistory] = useState<string[]>();
  const [taskList, setTaskList] = useState<taskListType[]>([
    { id: '', text: '暂时没有作业' },
  ]);
  useEffect(() => {
    selected &&
      get(`/task/assigned/list?group=${selected.value}`).then(
        (res: backType<titleListType>) => {
          setTaskList([{ id: '', text: '暂时没有作业' }]);
          setJudged(false);
          if (res.data.titles) {
            setTaskList(res.data.titles.reverse());
          }
        },
        null,
      );
  }, [selected]);

  const handleSwitch = (e: TaskInfoType, id: string) => {
    get(`/task/assigned/${id}/status`).then((res: backType<statusType>) => {
      setUploadHistory(undefined);
      if (res.code != -1 && res.data.task_status != '未提交') {
        get(`/task/submitted?user_id=myself&assigned_task_id=${id}`).then(
          (resp: backType<userTaskType>) => {
            setUploadHistory(resp.data.urls);
            setJudged(res.data?.task_status === '已审阅');
            setSubmissionID(resp.data?.submission_id as string);
          },
          null,
        );
      } else {
        setUploadHistory(undefined);
        setJudged(false);
      }
    }, null);
    setCurrentTaskID(id);
    setCurrentTaskInfo(e);
  };
  const handleChange = (e: dataType) => {
    setSelected(e);
  };
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#FFC93F',
          },
        }}
      >
        <PageWrapMobile title="提交作业" backPath={'/app'}>
          <TopBarMobile onChange={handleChange}></TopBarMobile>
          <div className="user-mobile-drop">
            {'选择作业 : '}
            <DropDownPure
              pure
              type="user"
              data={taskList}
              onSwitch={handleSwitch}
            ></DropDownPure>
          </div>
          {judged ? (
            <SubmitJudged
              currentTaskInfo={currentTaskInfo}
              uploadHistory={uploadHistory}
              submissionID={SubmissionID}
            />
          ) : (
            <SubmitBeforeJudge
              currentTaskID={currentTaskID}
              currentTaskInfo={currentTaskInfo}
              uploadHistory={uploadHistory}
              group={selected?.value}
            />
          )}
        </PageWrapMobile>
      </ConfigProvider>
    </>
  );
};

export default HomeworkUserSubmitMobile;
