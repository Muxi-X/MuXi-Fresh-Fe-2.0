import { get } from '../fetch';

let deadlineRequest: Promise<string> | undefined;

function getRecruitDeadline(): Promise<string> {
  deadlineRequest ??= get('/recruit/deadline', false)
    .then((res) => {
      const deadline = res.data?.deadline;
      return typeof deadline === 'string' ? deadline : '';
    })
    .catch(() => '');

  return deadlineRequest;
}

export async function hasRecruitDeadlinePassed(): Promise<boolean> {
  const deadline = await getRecruitDeadline();
  if (!deadline) return false;

  const deadlineDate = new Date(`${deadline.replace(' ', 'T')}+08:00`);
  return !Number.isNaN(deadlineDate.getTime()) && Date.now() > deadlineDate.getTime();
}