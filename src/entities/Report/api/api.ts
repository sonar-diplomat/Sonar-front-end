import { apiClient } from '@shared/api/oldBaseApi.ts';
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
    // Закомментировано: используйте useGetReportsQuery из @shared/api/rtkApi
    // list: (config?: RequestConfig) => apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.list, config),
    // Закомментировано: используйте useGetReportQuery из @shared/api/rtkApi
    // byId: (id: number, config?: RequestConfig) =>
    //     apiClient.get<ReportDTO>(API_ENDPOINTS.report.byId(id), config),
    delete: (id: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.report.delete(id), config),
    create: (body: CreateReportDTO, config?: RequestConfig) =>
        apiClient.post<ReportDTO>(API_ENDPOINTS.report.create, body, config),
    close: (id: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.report.close(id), undefined, config),
    // Закомментировано: используйте useGetReportsFilterQuery из @shared/api/rtkApi
    // filter: (filter: ReportFilterDTO, config?: RequestConfig) =>
    //     apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.filter, {
    //         ...config,
    //         params: {
    //             ...(config?.params ?? {}),
    //             filter: JSON.stringify(filter),
    //         },
    //     }),
    // Закомментировано: используйте useGetReportsByReporterQuery из @shared/api/rtkApi
    // byReporter: (reporterId: number, config?: RequestConfig) =>
    //     apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.byReporter(reporterId), config),
    // Закомментировано: используйте useGetOpenReportsQuery из @shared/api/rtkApi
    // open: (config?: RequestConfig) => apiClient.get<ReportDTO[]>(API_ENDPOINTS.report.open, config),
    // Закомментировано: используйте useGetReportReasonTypesQuery из @shared/api/rtkApi
    // reasonTypes: (config?: RequestConfig) =>
    //     apiClient.get<ReportReasonTypeDTO[]>(API_ENDPOINTS.report.reasonTypes, config),
    // Закомментировано: используйте useGetReportReasonTypeByIdQuery из @shared/api/rtkApi
    // reasonTypeById: (id: number, config?: RequestConfig) =>
    //     apiClient.get<ReportReasonTypeDTO>(API_ENDPOINTS.report.reasonTypeById(id), config),
    // Закомментировано: используйте useGetReportEntityTypesQuery из @shared/api/rtkApi
    // entityTypes: (config?: RequestConfig) =>
    //     apiClient.get<ReportableEntityTypeDTO[]>(API_ENDPOINTS.report.entityTypes, config),
    // Закомментировано: используйте useGetReportEntityTypeByIdQuery из @shared/api/rtkApi
    // entityTypeById: (id: number, config?: RequestConfig) =>
    //     apiClient.get<ReportableEntityTypeDTO>(API_ENDPOINTS.report.entityTypeById(id), config),
};
