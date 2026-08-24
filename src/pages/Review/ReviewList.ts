import { Group } from './ReviewFitler.ts';

export enum AdmissionStatus {
  '已报名' = '已报名',
  '实习期' = '实习期',
  '已转正' = '已转正',
}

export enum Gender {
  'male' = '男',
  'female' = '女',
}

export interface ReviewRow {
  admission_status: AdmissionStatus;
  extra_question: string;
  form_id: string;
  grader: string;
  group: Group;
  major: string;
  name: string;
  phone: string;
  reason: string;
  schedule_id: string;
  school: string;
  selfintro: string;
  understanding: string;
  user_id: string;
  gender: Gender;
}

export interface ReviewList {
  code: 0;
  msg: 'OK';
  data: {
    total: number;
    rows: ReviewRow[];
  };
}
