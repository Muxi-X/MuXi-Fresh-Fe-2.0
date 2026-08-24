import { get } from '../../../fetch.ts';
import { titleListType } from '../types';
import { getCurrentSeason } from '../../../utils/GetYearSeason/getReviewYear.ts';

/**
 * 获取某组别某学期的作业列表。
 *
 * 该接口是后端目前唯一未包 `{ code, msg, data }` 的接口，直接返回 `{ titles: [...] }`。
 * 因此这里显式传 `checkCode = false` 跳过 get() 的业务 code 校验——否则 res.code
 * 恒为 undefined，会被判定为业务失败并抛出 `Error: undefined`。
 *
 * 特殊适配集中在此处，页面组件请统一调用本函数，不要再直接写 get(url, true, false)。
 */
export async function getSelectedTaskList(
  group: string,
  year: number = new Date().getFullYear(),
  semester: string = getCurrentSeason(),
): Promise<titleListType> {
  const res = (await get(
    `/task/assigned/list/selected?group=${group}&year=${year}&semester=${semester}`,
    true,
    false,
  )) as titleListType;
  return res;
}
