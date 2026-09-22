import React, { useEffect, useState } from 'react';
import './index.less';
import Form, { Empty } from '../../../components/table';
import Selector from '../../../components/selector';
import SemesterSelector, { SemesterValue } from '../../../components/semesterSelector';
import { defData } from '../../../utils/deData';
import { dataType, titleListType } from '../../../types';
import { getSelectedTaskList } from '../../../utils/taskApi';
import { Button, Collapse, CollapseProps, message, Popconfirm } from 'antd';
import { getCurrentSeason } from '../../../../../utils/GetYearSeason/getReviewYear.ts';
import { del } from '../../../../../fetch.ts';

const HomeworkBrowse: React.FC = () => {
  const [taskList, setTaskList] = useState<CollapseProps['items']>([]);
  const [group, setGroup] = useState<dataType>(defData[0]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<string>(getCurrentSeason());

  const fetchTaskList = (g: dataType, y: number, s: string) => {
    void getSelectedTaskList(g.value, y, s).then((res: titleListType) => {
      const Res = res?.titles;
      if (Res && Res.length > 0) {
        const tasks: CollapseProps['items'] = Res.map((itm) => ({
          key: itm.id,
          label: (
            <div className="task-label">
              <span>{itm.text}</span>
              <Popconfirm
                title="确定删除这份作业吗？"
                description="删除后该作业及学员提交记录将无法恢复。"
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(itm.id)}
              >
                <Button
                  danger
                  type="link"
                  size="small"
                  onClick={(event) => event.stopPropagation()}
                >
                  删除
                </Button>
              </Popconfirm>
            </div>
          ),
          children: <Form task_id={itm.id} group={g.value}></Form>,
        }));
        setTaskList(tasks.reverse() as CollapseProps['items']);
      } else {
        message.info('暂无作业😵').then(null, null);
        setTaskList([
          {
            key: '',
            label: '暂无作业😵',
            children: (
              <div className="empty-wrap">
                <Empty />
              </div>
            ),
          },
        ]);
      }
    }, null);
  };

  const handleDelete = (taskId: string) => {
    void del(`/task/assigned/${taskId}`)
      .then(() => {
        message.success('作业已删除').then(null, null);
        fetchTaskList(group, year, semester);
      })
      .catch((error: unknown) => {
        message.error(error instanceof Error ? error.message : '删除作业失败').then(null, null);
      });
  };

  useEffect(() => {
    fetchTaskList(group, year, semester);
  }, [group, year, semester]);

  const handleGroupChange = (item: dataType): void => {
    setGroup(item);
  };

  const handleSemesterChange = (value: SemesterValue): void => {
    setYear(value.year);
    setSemester(value.semester);
  };

  return (
    <div className={'browse-wrapper'}>
      <div className="browse-wrap">
        <div className="browse-filter">
          <SemesterSelector value={{ year, semester }} onChange={handleSemesterChange} />
          <Selector
            title="选择组别"
            data={defData}
            onChange={(item) => handleGroupChange(item as dataType)}
            className="browse-selector"
          ></Selector>
        </div>
        <Collapse
          bordered={false}
          items={taskList}
          className="browse-collapse"
        ></Collapse>
      </div>
    </div>
  );
};

export default HomeworkBrowse;
