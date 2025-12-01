import React from 'react';

export interface backType<T> {
  code: number;
  msg: string;
  data: T;
}

export type GroupType = 'Product' | 'Design' | 'Frontend' | 'Backend';
// | 'Android'

export type taskListType = {
  id: string;
  text: React.ReactNode;
  disabled?: boolean;
};
export type dataType = {
  key: string;
  value: GroupType;
};

export type choiceType = 'edit' | 'new' | 'user-edit' | 'user-new';

export type TableType = {
  name: string;
  grade: string;
  school?: string;
  college?: string;
  status: string;
  user_id: string;
  key: string;
  group: string;
  task_id: string;
  avatar: string;
  email: string;
  version: number;
};

export type CommentType = {
  avatar: string;
  nickname: string;
  content: string;
  group: string;
  father_id: string;
  comment_id: string;
  replies: Array<CommentType>;
  create_time: string;
  name: string;
};

export type TaskInfoType = {
  title_text: string;
  content: string;
  urls: string[];
  deadline?: string;
  assignedTaskID?: string;
  group: string;
  semester: string;
  version?: number;
  year: number;
};

export type UserInfoType = {
  avatar: string;
  email: string;
  group: string;
  nickname: string;
  student_id: string;
};

export interface SelectorProps {
  title?: string;
  data: dataType[];
  className?: string;
  onChange?: (item: dataType) => void;
}

export type titleListType = {
  titles: taskListType[];
};

export type userInfoType = {
  avatar: string;
  email: string;
  group: string;
  name: string;
  nickname: string;
  qq: string;
  school: string;
  student_id: string;
};

export type completionType = {
  completions: completionInfoType[];
};

export type completionInfoType = {
  avatar: string;
  college: string;
  email: string;
  grade: string;
  name: string;
  status: string;
  user_id: string;
  version: number;
};

export type userTaskResponseType = {
  submission_infos: userTaskType[];
};
export type userTaskType = {
  urls: string[];
  submission_id?: string;
  time:string
};
export type cmtType = {
  comments: CommentType[];
};

export type statusType = {
  task_status: string;
};
export type formStatusType = {
  form_status: string;
  user_type: string;
};
export type formInfoType = {
  avatar: string;
  extra_question: string;
  gender: string;
  grade: string;
  group: string;
  knowledge: string;
  major: string;
  phone: string;
  reason: string;
  self_intro: string;
};
