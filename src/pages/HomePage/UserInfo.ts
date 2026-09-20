export interface UserInfo {
  avatar: string;
  name: string;
  nickname: string;
  school: string;
  email: string;
  group: string;
  student_id: string;
  qq: string;
}

export interface GetUserInfoResult {
  code: 200;
  msg: 'OK';
  data: UserInfo;
}

export interface ChangeEmailResult {
  code: 200;
  msg: 'OK';
  data: {
    flag: boolean;
  };
}

export interface ChangeUserInfoResult {
  code: 200;
  msg: 'OK';
  data: {
    flag: boolean;
  };
}
