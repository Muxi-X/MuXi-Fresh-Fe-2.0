import React, { useEffect, useState } from 'react';
import UploadSection from '../../../components/uploadWrap';
import { debounce } from '../../../../../utils/Debounce/debounce.ts';
import { get, post } from '../../../../../fetch.ts';
import {
  backType,
  cmtType,
  CommentType,
  dataType,
  statusType,
  taskListType,
  titleListType,
  userTaskResponseType,
  formInfoType,
  userTaskType,
  TaskInfoType,
} from '../../../types';
import { message, Select, UploadProps } from 'antd';
import { defData } from '../../../utils/deData';
import InputBox from '../../../components/input';
import './index.less';
import HomeComment from '../../adminMode/judge/comment';
import { getCurrentSeason } from '../../../../../utils/GetYearSeason/getReviewYear.ts';

const HomeworkUserSubmit: React.FC = () => {
  const [version, setVersion] = useState(0);
  const [taskList, setTaskList] = useState<taskListType[]>([{ id: '123', text: '123' }]);
  const [loading, setLoading] = useState(false);
  const [status, setstatus] = useState<number>(0);
  const [defList, setdefList] = useState<Array<userTaskType>>([]);
  const [formData, setformData] = useState<string[]>(['']);
  const [selected, setselected] = useState<string>('');
  const [group, setGroup] = useState<dataType>({ key: '后端组', value: 'Backend' });
  const [Comment, setComment] = useState<CommentType[]>([]);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>('');
  const [currentDeadline, setCurrentDeadline] = useState<string>('');
  const statusList = ['未提交', '已提交', '已审阅'];

  const root = 'https://ossfresh-test.muxixyz.com/';

  const isDeadlinePassed = (deadline: string): boolean => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return now > deadlineDate;
  };

  const selectList = defList.map((_, index) => {
    return {
      value: index,
      label: '提交' + index,
    };
  });

  useEffect(() => {
    setLoading(true);
    get('/form/view?entry_form_id=myself').then((res: backType<formInfoType>) => {
      const groupRes = res.data.group;
      defData.forEach((item) => {
        if (groupRes.includes(item.value)) {
          setGroup(item);
          get(
            `/task/assigned/list/selected?group=${
              item.value
            }&year=${new Date().getFullYear()}&semester=${getCurrentSeason()}`,
          ).then((res: titleListType) => {
            console.log(res);
            setLoading(false);
            if (res) {
              setTaskList(res.titles.reverse());
              get(
                `/task/submitted?user_id=myself&assigned_task_id=${taskList[0].id}`,
              ).then((resp: backType<userTaskResponseType>) => {
                console.log(resp.data.submission_infos, '提交记录');

                if (
                  resp.data?.submission_infos &&
                  resp.data.submission_infos.length > 0
                ) {
                  setdefList(resp.data.submission_infos);
                  setCurrentSubmissionId(
                    resp.data.submission_infos[version].submission_id || '',
                  );
                  getComment(resp.data.submission_infos[version].submission_id || '');
                }
              }, null);
            } else {
              setTaskList([{ id: '', text: '暂时没有作业' }]);
            }
          }, null);
        }
      });
    }, null);
  }, []);

  const handleVersionChange = (value: number) => {
    if (defList.length === 0) return;
    console.log(value);
    setCurrentSubmissionId(defList[value].submission_id || '');
    setVersion(value);
    console.log(defList[value].urls);
  };

  const handleSubmit = () => {
    if (status != 2 && formData[0]) {
      console.log(formData);
      post(`/task/submitted`, {
        urls: formData,
        assignedTaskID: selected,
      })
        .then(() => {
          message.success('提交成功').then(null, null);
          handleSwitch(selected);
        })
        .catch(() => {
          message.error(`提交失败`).then(null, null);
        });
    } else if (!formData[0]) {
      message.error('作业内容不能为空').then(null, null);
    }
  };
  const handleChangeUpload = (e: UploadProps['fileList']) => {
    if (e && e[0]) {
      const tmpList = e?.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (item?.response) return ` ${root}${item?.response?.key as string}`;
        else return `${item.url as string}`;
      });
      setformData(tmpList ? tmpList.filter((item) => item != 'undefined') : ['']);
    }
  };
  const handleSwitch = (id: string | undefined): void => {
    if (id) {
      setselected(id);

      get(`/task/assigned/${id}`).then((taskRes: backType<TaskInfoType>) => {
        if (taskRes.data?.deadline) {
          setCurrentDeadline(taskRes.data.deadline);
        }
      }, null);

      get(`/task/assigned/${id}/status`).then((res: backType<statusType>) => {
        get(`/task/submitted?user_id=myself&assigned_task_id=${id}`).then(
          (resp: backType<userTaskResponseType>) => {
            console.log(resp.data.submission_infos);
            if (resp.data?.submission_infos && resp.data.submission_infos.length > 0) {
              setdefList(resp.data.submission_infos);
              setVersion(0);
              setCurrentSubmissionId(resp.data.submission_infos[0].submission_id || '');
              getComment(resp.data.submission_infos[0].submission_id || '');
            } else {
              setdefList([]);
              setCurrentSubmissionId('');
              setComment([]);
              setVersion(0);
            }
          },
          null,
        );

        const stat: string = res.data.task_status;
        setstatus(statusList.indexOf(stat));
      }, null);
    }
  };
  const getComment = (SubmitID: string) => {
    get(`/task/submitted/${SubmitID}/comment`).then((res: backType<cmtType>) => {
      const comments = res.data?.comments;
      if (comments) {
        setComment(comments.reverse());
      } else {
        setComment([]);
      }
    }, null);
  };

  const refreshComments = () => {
    if (currentSubmissionId) {
      getComment(currentSubmissionId);
    }
  };
  return (
    <>
      <div className={'user-submit'} style={{ display: 'flex' }}>
        <UploadSection
          onSwitch={handleSwitch}
          taskList={taskList}
          loading={loading}
          choice="user-edit"
          title={`${group.key}作业`}
          status={status}
          group={group.value}
          onSubmit={debounce(handleSubmit, 400)}
          submitDisabled={status == 2 || isDeadlinePassed(currentDeadline)}
          className={'user-submit-preview-small'}
          deadlineAvailable={true}
          button_title="提交作业"
        >
          {selectList.length > 0 && (
            <Select
              options={selectList}
              onChange={handleVersionChange}
              value={selectList[version]?.value || selectList[0]?.value}
              className="select-version"
            ></Select>
          )}
          <InputBox
            key={version}
            className="inp"
            type="file"
            label="上传作业"
            defaultValue={defList[version]?.urls || defList[0]?.urls || []}
            disabled={status == 2 || (taskList && !taskList[0].id)}
            onChange={(files) => handleChangeUpload(files as UploadProps['fileList'])}
          ></InputBox>
        </UploadSection>
        {defList.length > 0 && (
          <HomeComment
            SubmitId={currentSubmissionId}
            CommentData={Comment}
            className="user-submit-comment"
            onCommentSuccess={refreshComments}
          ></HomeComment>
        )}
      </div>
    </>
  );
};

export default HomeworkUserSubmit;
