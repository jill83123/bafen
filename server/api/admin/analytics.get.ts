type GA4ReportResponse = {
  dimensionHeaders?: { name: string }[];
  metricHeaders?: { name: string }[];
  rowCount?: number;
  rows?: {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
  }[];
};

type GA4MonthlyUsersItem = {
  month: string;
  users: number;
};

// "202501" -> "2025-01"
const formatYearMonth = (raw: string): string => `${raw.slice(0, 4)}-${raw.slice(4, 6)}`;

const getMonthsAgoStartDate = (monthsAgo: number): string => {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

// 產生最近 12 個月的月份清單，由舊到新排序
const getLast12MonthKeys = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  return months;
};

// 補 GA4 可能有缺月的資料
const fillMissingMonths = (
  data: GA4MonthlyUsersItem[],
  monthKeys: string[],
): GA4MonthlyUsersItem[] => {
  const dataMap = new Map(data.map((item) => [item.month, item.users]));
  return monthKeys.map((month) => ({ month, users: dataMap.get(month) ?? 0 }));
};

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const accessToken = await getGoogleAccessToken(
    config.gaClientEmail,
    config.gaPrivateKey.replace(/\\n/g, '\n'),
    'https://www.googleapis.com/auth/analytics.readonly',
  );

  if (!accessToken) throw createError({ statusCode: 500, message: '伺服器錯誤，請稍後再試' });

  const propertyId = config.gaPropertyId;
  const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const headers = { Authorization: `Bearer ${accessToken}` };

  const last12MonthsStartDate = getMonthsAgoStartDate(11);

  // 近 7 天訪客數
  const weeklyReport = await $fetch<GA4ReportResponse>(baseUrl, {
    method: 'POST',
    headers,
    body: {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    },
  });

  // 總訪客數
  const totalReport = await $fetch<GA4ReportResponse>(baseUrl, {
    method: 'POST',
    headers,
    body: {
      dateRanges: [{ startDate: '2026-01-01', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    },
  });

  // 近 12 個月每月訪客數
  const monthlyReport = await $fetch<GA4ReportResponse>(baseUrl, {
    method: 'POST',
    headers,
    body: {
      dateRanges: [{ startDate: last12MonthsStartDate, endDate: 'today' }],
      dimensions: [{ name: 'yearMonth' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
    },
  });

  // 熱門作品前三名（不限時間）
  const topWorksReport = await $fetch<GA4ReportResponse>(baseUrl, {
    method: 'POST',
    headers,
    body: {
      dateRanges: [{ startDate: '2026-01-01', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'FULL_REGEXP',
            value: '^/works/.+$',
          },
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 3,
    },
  });

  const rawMonthlyUsers: GA4MonthlyUsersItem[] =
    monthlyReport.rows?.map((row) => ({
      month: formatYearMonth(row.dimensionValues?.[0]?.value ?? ''),
      users: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? [];

  return {
    weeklyUsers: Number(weeklyReport.rows?.[0]?.metricValues?.[0]?.value ?? 0),
    totalUsers: Number(totalReport.rows?.[0]?.metricValues?.[0]?.value ?? 0),
    monthlyUsers: fillMissingMonths(rawMonthlyUsers, getLast12MonthKeys()),
    topWorks:
      topWorksReport.rows?.map((row) => ({
        path: row.dimensionValues?.[0]?.value,
        views: Number(row.metricValues?.[0]?.value ?? 0),
      })) ?? [],
  };
});
