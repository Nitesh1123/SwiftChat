import type { StatsRange, UserStats } from "@/types/stats.types";
import api from "./api";

export const fetchStats = async (days: StatsRange): Promise<UserStats> => {
  const res = await api.get("/user/stats", {
    params: { days, tz: new Date().getTimezoneOffset() },
  });
  return res.data.data;
};
