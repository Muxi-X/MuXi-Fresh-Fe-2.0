import React, { HTMLAttributes, useEffect, useState } from 'react';
import { Avatar, Button, Card, Divider, Input, List, Tag } from 'antd';
import './index.less';
import Title from '../../../../components/title';
import { CommentType } from '../../../../types';
import { post } from '../../../../../../fetch';
import { debounce } from '../../../../../../utils/Debounce/debounce';

const { Meta } = Card;
interface CommentProps {
  CommentData: CommentType[];
  SubmitId: string;
  onCommentSuccess?: () => void;
}
interface TitleTagProps {
  item: CommentType;
  className?: string;
}

const HomeComment: React.FC<HTMLAttributes<HTMLDivElement> & CommentProps> = (props) => {
  const { CommentData, SubmitId, onCommentSuccess, ...restProps } = props;
  const [loading, setLoading] = useState(true);
  const [openReply, setOpenReply] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState<Record<string, string>>({});
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [CommentData]);

  //切换回复按钮状态：
  function toggleOpenReply(comment_id: string) {
    setOpenReply((pre) => ({
      ...pre,
      [comment_id]: pre[comment_id] ? !pre[comment_id] : true,
    }));
  }

  function inputReply(comment_id: string, content: string) {
    setReply((pre) => ({
      ...pre,
      [comment_id]: content,
    }));
  }

  function handlePulishComment() {
    post(`/task/submitted/${SubmitId}/comment`, {
      id: SubmitId,
      content: comment,
    })
      .then((res) => {
        console.log(res.data, '发表评论成功');
        setComment('');
        onCommentSuccess?.();
      })
      .catch((err) => {
        console.error(err, '发表评论失败');
      });
  }

  async function handlePublishReply(comment_id: string, content: string) {
    try {
      const response = await post(`/task/submitted/${SubmitId}/comment/reply`, {
        id: SubmitId,
        father_id: comment_id,
        content: content,
      });
      if (response.data.flag === true) {
        console.log('发表回复成功');
        setReply((pre) => ({
          ...pre,
          [comment_id]: '',
        }));
        setOpenReply((pre) => ({
          ...pre,
          [comment_id]: false,
        }));
        onCommentSuccess?.();
      } else {
        console.log('发表回复失败');
      }
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <div {...restProps}>
      <Card
        className="comment-card"
        title={
          <Title title="评论区" style={{ marginLeft: '0' }}>
            评论区
          </Title>
        }
      >
        <List
          dataSource={CommentData}
          className="comment-wrap"
          renderItem={(item, index) => (
            <List.Item key={index}>
              {/* 根评论 */}
              <Card
                style={{ width: '90%', margin: 'auto', whiteSpace: 'pre-wrap' }}
                loading={loading}
              >
                <Meta
                  avatar={
                    <Avatar
                      src={
                        item.avatar
                          ? item.avatar
                          : 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=1'
                      }
                    />
                  }
                  title={<TitleTag item={item}></TitleTag>}
                  description={`${item.content.replace(/\n/g, '\r\n')}`}
                />
                <div className="time-reply">
                  <div className="create_time">{item.create_time}</div>
                  <button
                    className="replybtn"
                    onClick={() => {
                      toggleOpenReply(item.comment_id);
                    }}
                  >
                    <img
                      className="replybtn-img"
                      src="https://ossfresh-test.muxixyz.com/%E8%AF%84%E8%AE%BA.svg"
                    />
                    <text className="replybtn-text">回复</text>
                  </button>
                </div>

                {openReply[item.comment_id] && (
                  <div className="reply-input">
                    <Input
                      placeholder={'回复' + item.nickname}
                      className="input"
                      value={reply[item.comment_id]}
                      onChange={(e) => inputReply(item.comment_id, e.target.value)}
                    />
                    <Button
                      className="btn"
                      onClick={() =>
                        handlePublishReply(item.comment_id, reply[item.comment_id])
                      }
                    >
                      回复
                    </Button>
                  </div>
                )}

                {item.replies &&
                  item.replies.map((ite, index) => {
                    return (
                      <div key={index}>
                        <Divider />
                        <Meta
                          className="reply-tag"
                          key={index}
                          avatar={
                            <Avatar
                              src={
                                ite.avatar
                                  ? ite.avatar
                                  : 'https://xsgames.co/randomusers/avatar.php?g=pixel&key=1'
                              }
                            />
                          }
                          title={
                            <div className="reply-tag-text">
                              {ite.name ? ite.name : ite.nickname} 回复{' '}
                              {item.name ? item.name : item.nickname}
                            </div>
                          }
                          description={`${ite.content.replace(/\n/g, '\r\n')}`}
                        />
                        <div className="time">{ite.create_time}</div>
                      </div>
                    );
                  })}
              </Card>
            </List.Item>
          )}
        />
        <div className="comment-box">
          <Input
            className="comment-input"
            suffix={
              <img
                src="https://ossfresh-test.muxixyz.com/%E5%AE%B9%E5%99%A8%404x%20%284%29.png"
                className="submit-suffix"
                onClick={debounce(handlePulishComment, 400)}
              />
            }
            placeholder="发表一下你的评论吧..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default HomeComment;
export const TitleTag: React.FC<TitleTagProps> = (props) => {
  const { item, className } = props;
  const renderName = (name: string) => {
    if (!name) return '管理员';
    if (name.length > 8) return `${name.slice(0, 8)}...`;
    return name;
  };
  return (
    <div className={className}>
      {renderName(item.name ? item.name : item.nickname)}
      <Tag color="orange" className="comment-tag">
        {item.group}
      </Tag>
    </div>
  );
};
