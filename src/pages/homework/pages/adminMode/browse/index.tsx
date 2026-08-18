import React, { useEffect, useState } from 'react';
import './index.less';
import Form, { Empty } from '../../../components/table';
import Selector from '../../../components/selector';
import SemesterSelector, { SemesterValue } from '../../../components/semesterSelector';
import { defData } from '../../../utils/deData';
import { dataType, titleListType } from '../../../types';
import { get } from '../../../../../fetch.ts';
import { Collapse, CollapseProps, message } from 'antd';
import { getCurrentSeason } from '../../../../../utils/GetYearSeason/getReviewYear.ts';

const HomeworkBrowse: React.FC = () => {
  const [taskList, setTaskList] = useState<CollapseProps['items']>([]);
  const [group, setGroup] = useState<dataType>(defData[0]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<string>(getCurrentSeason());

  const fetchTaskList = (g: dataType, y: number, s: string) => {
    void get(
      `/task/assigned/list/selected?group=${g.value}&year=${y}&semester=${s}`,
    ).then((res: titleListType) => {
      const Res = res?.titles;
      if (Res && Res.length > 0) {
        const tasks: CollapseProps['items'] = Res.map((itm) => ({
          key: itm.id,
          label: itm.text,
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
              <div style={{ height: '40vh' }}>
                <Empty />
              </div>
            ),
          },
        ]);
      }
    }, null);
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
