import { Op } from "sequelize";
import type { ReportQueryFilterDTO } from "../interfaces/report.interfaces.js";


export function buildDateFilter(filter?: ReportQueryFilterDTO): any {
  if (!filter?.startDate && !filter?.endDate) {
    return {};
  }

  const dateFilter: any = {};

  if (filter.startDate && filter.endDate) {
    dateFilter.createdAt = {
      [Op.between]: [filter.startDate, filter.endDate],
    };
  } else if (filter.startDate) {
    dateFilter.createdAt = { [Op.gte]: filter.startDate };
  } else if (filter.endDate) {
    dateFilter.createdAt = { [Op.lte]: filter.endDate };
  }

  return dateFilter;
}
