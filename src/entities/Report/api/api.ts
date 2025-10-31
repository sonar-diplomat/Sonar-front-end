import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type {
    CreateReportDTO,
    ReportDTO,
    ReportFilterDTO,
    ReportReasonTypeDTO,
    ReportableEntityTypeDTO,
} from '../model/types.ts';
import type {RequestConfig} from "@shared/types";


export const ReportApi = {
    list: (config?: RequestConfig) => apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.list, config),
    byId: (id: number, config?: RequestConfig) =>
        apiClient.get<ReportDTO>(API_ENDPOINTS.report.byId(id), config),
    delete: (id: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.report.delete(id), config),
    create: (body: CreateReportDTO, config?: RequestConfig) =>
        apiClient.post<ReportDTO>(API_ENDPOINTS.report.create, body, config),
    close: (id: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.report.close(id), undefined, config),
    filter: (filter: ReportFilterDTO, config?: RequestConfig) =>
        apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.filter, {
            ...config,
            params: {
                ...(config?.params ?? {}),
                filter: JSON.stringify(filter),
            },
        }),
    byReporter: (reporterId: number, config?: RequestConfig) =>
        apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.byReporter(reporterId), config),
    open: (config?: RequestConfig) => apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.open, config),
    reasonTypes: (config?: RequestConfig) =>
        apiClient.get<ReportReasonTypeDTO[]>(API_ENDPOINTS.report.reasonTypes, config),
    reasonTypeById: (id: number, config?: RequestConfig) =>
        apiClient.get<ReportReasonTypeDTO>(API_ENDPOINTS.report.reasonTypeById(id), config),
    entityTypes: (config?: RequestConfig) =>
        apiClient.get<ReportableEntityTypeDTO[]>(API_ENDPOINTS.report.entityTypes, config),
    entityTypeById: (id: number, config?: RequestConfig) =>
        apiClient.get<ReportableEntityTypeDTO>(API_ENDPOINTS.report.entityTypeById(id), config),
};
