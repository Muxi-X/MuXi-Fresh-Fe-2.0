import React, { CSSProperties, useEffect, useState } from 'react';
import './index.less';
import Selector from '../selector';
import UploadSection from '../uploadWrap';
import { post } from '../../../../fetch.ts';
import {
  choiceType,
  dataType,
  TaskInfoType,
  taskListType,
  titleListType,
} from '../../types';
import { message } from 'antd';
import { defData } from '../../utils/deData';
import { useNavigate } from 'react-router-dom';
import { getSelectedTaskList } from '../../utils/taskApi';

interface HomeworkSubmitProps {
  title?: string;
  choice?: choiceType;
  button_title?: string;
  className?: string;
  style?: CSSProperties;
}

const HomeworkSubmit: React.FC<HomeworkSubmitProps> = (props) => {
  const [selected, setselected] = useState<dataType>();
  const [loading, setLoading] = useState<boolean>(true);
  const [taskList, setTaskList] = useState<taskListType[]>([]);
  const { title, button_title, choice, ...restProps } = props;
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    handleChange(defData[0]);
  }, []);
  const nav = useNavigate();
  const handleChange = (item: dataType) => {
    setselected(item);
    setLoading(true);
    UpdateTaskList(item);
  };
  const handleSubmit = (query: TaskInfoType) => {
    post(`/task/assigned?group=${selected ? selected?.value : ''}`, query)
      .then(() => {
        UpdateTaskList(selected as dataType);
        if (choice && choice.includes('new')) {
          nav('/app/homework/admin/edit');
        }
        message.success('提交成功').then(null, null);
      })
      .catch((e) => {
        message.error(`提交失败`).then(null, null);
        console.log(e);
      });
  };

  const UpdateTaskList = (item: dataType) => {
    getSelectedTaskList(item.value).then((res: titleListType) => {
      console.log(res);
      setLoading(false);
      if (res?.titles) {
        setTaskList(res.titles.reverse());
      } else {
        setTaskList([{ id: '', text: '暂时没有作业' }]);
      }
    }, null);
  };
  return (
    <div id="homework-edit-wrap" {...restProps}>
      <Selector
        title="组别选择"
        data={defData}
        className="selector-edit"
        onChange={(item) => handleChange(item as dataType)}
      ></Selector>
      <UploadSection
        onSubmit={handleSubmit}
        choice={choice ? choice : 'edit'}
        title={title ? title : '修改作业'}
        button_title={button_title ? button_title : '确认修改'}
        taskList={taskList}
        loading={loading}
        group={selected?.value || defData[0].value}
        deadlineAvailable={false}
      ></UploadSection>
    </div>
  );
};

export default HomeworkSubmit;
