import React, { useEffect, useState } from 'react';
import { Avatar, Card } from 'antd';
import './index.less';
import Title from '../../../../components/title';
import FileLink from '../../../../components/files/index';
import { defData } from '../../../../utils/deData';
import { get } from '../../../../../../fetch.ts';
import {
  backType,
  TableType,
  TaskInfoType,
  userTaskResponseType,
  userTaskType,
} from '../../../../types';

const { Meta } = Card;
interface TagListProps {
  tag_name: string;
  children: React.ReactNode;
  className?: string;
}
interface HomePreviewProps {
  info: TableType;
  getSubmittionID?: (str: string) => void;
}
const HomePreview: React.FC<HomePreviewProps> = (props) => {
  const { info, getSubmittionID } = props;
  const [loading, setLoading] = useState(true);
  const [groupName, setgroupName] = useState<string>('');
  const [urls, seturls] = useState<string[]>(['']);
  const [Preview, setPreview] = useState<TaskInfoType>({
    title_text: '',
    content: '',
    urls: [],
  });
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    console.log(info, info.version - 1);

    defData.forEach((item) => {
      if (item.value == info?.group) {
        setgroupName(item.key);
      }
    });
    info?.task_id &&
      get(`/task/assigned/${info?.task_id}`).then((res: backType<TaskInfoType>) => {
        setPreview(res.data);
        get(
          `/task/submitted?user_id=${info?.user_id}&assigned_task_id=${info?.task_id}`,
        ).then((res: backType<userTaskResponseType>) => {
          seturls(
            res.data.submission_infos.length > 0
              ? res.data.submission_infos[info.version - 1].urls
              : [],
          );
          getSubmittionID &&
            getSubmittionID(
              res.data.submission_infos.length > 0
                ? (res.data.submission_infos[info.version - 1].submission_id as string)
                : '',
            );
        }, null);
      }, null);
    setLoading(!loading);
  }, []);
  return (
    <>
      <Card
        className="homePreview-wrap"
        style={{ overflowY: 'auto' }}
        title={
          <Title title={`${groupName}作业`} style={{ marginLeft: '0' }}>
            评论区
          </Title>
        }
        loading={loading}
      >
        <div className="homePreview-card">
          <TagList tag_name="作业描述">
            <div className="description-card">{Preview?.title_text}</div>
          </TagList>
          <TagList tag_name="提交人">
            <Card className="uploader-card">
              <Meta
                avatar={
                  <Avatar
                    src={
                      info?.avatar
                        ? info?.avatar
                        : 'https://xsgames.co/randomusers/avatar.php?g=pixel'
                    }
                  />
                }
                title={info?.name}
                description={info?.email}
              />
            </Card>
          </TagList>
          <TagList tag_name="作业概述">
            <div className="description-card" style={{ height: '30vh' }}>
              {Preview.content.replace(/\n/gi, `\r\n`)}
            </div>
          </TagList>
          <FileLink data={Preview.urls}></FileLink>
          <FileLink data={urls} title="作业内容"></FileLink>
        </div>
      </Card>
    </>
  );
};

export default HomePreview;

export const TagList: React.FC<TagListProps> = (props) => {
  const { tag_name, children, className } = props;
  return (
    <>
      <div className={`tag-wrap ${className as string}`}>
        <div className="tag-name">{tag_name}</div>
        <div className="tag-content">{children}</div>
      </div>
    </>
  );
};
