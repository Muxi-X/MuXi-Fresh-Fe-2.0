import React, { CSSProperties, useState } from 'react';
import { Card, message, UploadProps } from 'antd';
import InputBox from '../input';
import './index.less';
import Submit from '../button';
import DropDown from '../dropDown';
import Title from '../title';
import { root } from '../../utils/deData';
import { choiceType, TaskInfoType, taskListType } from '../../types';
import FileLink from '../files';
import { debounce } from '../../../../utils/Debounce/debounce.ts';

interface UploadSectionProps {
  title?: string;
  status?: number;
  className?: string;
  style?: CSSProperties;
  button_title?: string;
  choice: choiceType;
  taskList?: taskListType[];
  loading?: boolean;
  onSubmit?: (query: TaskInfoType) => void;
  children?: React.ReactNode;
  submitClass?: string;
  onSwitch?: (item: string | undefined) => void;
  submitDisabled?: boolean;
}

type formTitleType = {
  assignedTaskID?: string;
  title_text: string;
};

const UploadSection: React.FC<UploadSectionProps> = (props) => {
  const {
    title,
    onSwitch,
    submitClass,
    children,
    onSubmit,
    loading,
    status,
    className,
    style,
    button_title,
    choice,
    taskList = [],
    submitDisabled,
  } = props;

  const [formData, setformData] = useState<string[]>();
  const [defaultValue, setDefaultValue] = useState<TaskInfoType>({
    title_text: '',
    content: '',
    urls: [''],
  });
  const [formTitle, setFormTitle] = useState<formTitleType>({
    title_text: '',
    assignedTaskID: '',
  });
  const [formContent, setFormContent] = useState<string>();
  const statusList: string[] = ['未提交', '已提交', '已批阅'];

  const handleChangeTitle = (e: taskListType) => {
    if (choice.includes('edit')) {
      setFormTitle({ title_text: e.text as string, assignedTaskID: e.id });
      return;
    }
    setFormTitle({ title_text: e.text as string });
  };

  const handleSwitch = (e: TaskInfoType, id: string) => {
    if (e) {
      setDefaultValue(e);
      onSwitch && onSwitch(id);
    }
  };

  const handleChangeContent = (e: string) => {
    setFormContent(e);
  };

  const handleChangeUpload = (e: UploadProps['fileList']) => {
    const tmpList = e?.map((item) => {
      if (
        item &&
        item.response &&
        typeof item.response === 'object' &&
        'key' in item.response &&
        typeof (item.response as { key: string }).key === 'string'
      ) {
        return `${root}${(item.response as { key: string }).key}`;
      } else if (item.url) {
        return item.url;
      }
      return '';
    });
    setformData(tmpList?.filter((item) => item !== 'undefined' && item !== ''));
  };

  const handleSubmit = () => {
    const query: TaskInfoType = {
      ...formTitle,
      content: formContent || '',
      urls: formData || [],
    };
    if (!formTitle.title_text.length) {
      message.error('作业名称不能为空').then(null, null);
      return;
    }
    if (!formContent?.length) {
      message.error('内容简介不能为空').then(null, null);
      return;
    }
    onSubmit && onSubmit(query);
  };

  return (
    <>
      <Card
        title={
          <Title
            extra={
              <>
                {typeof status !== 'undefined' && (
                  <div className="upload-status">{statusList[status]}</div>
                )}
              </>
            }
            title={title}
          ></Title>
        }
        className={'upload-wrap ' + (className || '')}
        style={style}
        loading={loading}
      >
        <div className="upload-upload">
          {choice.includes('new') ? (
            <InputBox
              defaultValue={[defaultValue.title_text]}
              label="标题"
              type="input"
              className="inp more"
              limit={30}
              onChange={(str) =>
                handleChangeTitle({
                  id: '',
                  text: str as string,
                })
              }
            ></InputBox>
          ) : (
            <DropDown
              type={choice.includes('user') ? 'user' : 'admin'}
              onSwitch={handleSwitch}
              data={taskList}
              onChoose={(e) => handleChangeTitle(e)}
            ></DropDown>
          )}
          <InputBox
            label="内容简介"
            type="textarea"
            className="inp"
            limit={500}
            defaultValue={[defaultValue.content]}
            onChange={(str) => handleChangeContent(str as string)}
            disabled={choice.includes('user')}
          ></InputBox>
          {!choice.includes('user') ? (
            <InputBox
              label="附件"
              type="file"
              className="inp"
              onChange={(files) => handleChangeUpload(files as UploadProps['fileList'])}
              defaultValue={defaultValue.urls ? defaultValue.urls : []}
              disabled={
                choice.includes('user') ||
                (Array.isArray(taskList) &&
                  taskList.length > 0 &&
                  !taskList[0]?.id &&
                  !choice.includes('new'))
              }
            ></InputBox>
          ) : (
            <FileLink className="inp" data={defaultValue.urls}></FileLink>
          )}
          {children}
          <Submit
            className={`submit-page  ${submitClass || ''}`}
            onClick={debounce(handleSubmit, 400)}
            disabled={
              submitDisabled
                ? submitDisabled
                : !choice.includes('new') &&
                  taskList &&
                  taskList.length > 0 &&
                  !taskList[0]?.id
            }
          >
            {button_title}
          </Submit>
        </div>
      </Card>
    </>
  );
};

export default UploadSection;
