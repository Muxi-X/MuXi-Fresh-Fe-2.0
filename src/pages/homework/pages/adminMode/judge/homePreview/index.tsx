import React, { useEffect, useState } from 'react';
import { Avatar, Card, Select } from 'antd';
import './index.less';
import Title from '../../../../components/title';
import FileLink from '../../../../components/files/index';
import { defData } from '../../../../utils/deData';
import { get } from '../../../../../../fetch.ts';
import {
  backType,
  TableType,
  TaskInfoType,
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
  version:number;
  submissionInfo:userTaskType[];
  // getSubmittionID?: (str: string) => void;
}
const HomePreview: React.FC<HomePreviewProps> = (props) => {
  const {info,version,submissionInfo} = props;
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
    
    defData.forEach((item) => {
      if (item.value == info?.group) {
        setgroupName(item.key);
      }
    });
    info?.task_id &&
      get(`/task/assigned/${info?.task_id}`).then((res: backType<TaskInfoType>) => {
        setPreview(res.data);
      }, null);
    setLoading(false);
  }, []);
  
  // 监听submissionInfo和version变化，更新urls
  useEffect(() => {
    if(submissionInfo.length>0 && version > 0){
      seturls(submissionInfo[version-1].urls || [])
    }
  }, [submissionInfo, version]);
  
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