import { Season } from '../../pages/Review/ReviewFitler.ts';

// 秋招/秋季学期从 8 月开始：报名在 8 月开放（截止 9/26），后端也把 8 月提交的报名表
// 记到 autumn 周期。此前分界写成 month < 9，导致整个 8 月被判成 spring，
// Review 默认查 2026spring（空桶）且下拉里根本没有 2026autumn 选项。
const getSeason = (month: number) => (month < 8 ? Season.Spring : Season.Autumn);
export const getCurrentSeason = () => getSeason(new Date().getMonth() + 1);

const chineseSeasons = {
  [Season.Spring]: '春招',
  [Season.Autumn]: '秋招',
};

const generateYearObject = (year: number, season: Season.Spring | Season.Autumn) => ({
  value: `${year}${season}`,
  label: `${year}年${chineseSeasons[season]}`,
});

export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();
  let years: { value: string; label: string }[] = [];

  for (let year = currentYear - 1; year > currentYear - 4; year--) {
    years = years.concat([
      generateYearObject(year, Season.Autumn),
      generateYearObject(year, Season.Spring),
    ]);
  }

  years.unshift(generateYearObject(currentYear, Season.Spring));

  if (currentSeason === Season.Autumn) {
    years.unshift(generateYearObject(currentYear, Season.Autumn));
  }

  return years;
};
