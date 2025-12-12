import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type {
  ReportDTO,
  ReportFilterDTO,
  ReportReasonTypeDTO,
  ReportableEntityTypeDTO,
  CreateReportDTO,
} from '../model/types';

/**
 * Report API endpoints
 */
export const reportApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<ReportDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    getReport: builder.query<ReportDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Report', id }],
    }),

    getReportsFilter: builder.query<ReportDTO[], { filter: ReportFilterDTO }>({
      query: ({ filter }) => ({
        url: API_ENDPOINTS.report.filter,
        method: 'GET',
        withAuth: true,
        params: {
          filter: JSON.stringify(filter),
        },
      }),
      providesTags: [{ type: 'Report', id: 'FILTERED' }],
    }),

    getReportsByReporter: builder.query<ReportDTO[], number>({
      query: (reporterId) => ({
        url: API_ENDPOINTS.report.byReporter(reporterId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, reporterId) => [{ type: 'Report', id: `reporter-${reporterId}` }],
    }),

    getOpenReports: builder.query<ReportDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.open,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Report', id: 'OPEN' }],
    }),

    getReportReasonTypes: builder.query<ReportReasonTypeDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.reasonTypes,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ReportReasonType', id: 'LIST' }],
    }),

    getReportReasonTypesByEntityType: builder.query<ReportReasonTypeDTO[], number>({
      query: (entityTypeId) => ({
        url: API_ENDPOINTS.report.reasonTypesByEntityType(entityTypeId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, entityTypeId) => [
        { type: 'ReportReasonType', id: `entity-type-${entityTypeId}` },
      ],
    }),

    getReportReasonTypeById: builder.query<ReportReasonTypeDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.reasonTypeById(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'ReportReasonType', id }],
    }),

    getReportEntityTypes: builder.query<ReportableEntityTypeDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.entityTypes,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ReportableEntityType', id: 'LIST' }],
    }),

    getReportEntityTypeById: builder.query<ReportableEntityTypeDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.entityTypeById(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'ReportableEntityType', id }],
    }),

    createReport: builder.mutation<ReportDTO, CreateReportDTO>({
      query: (dto) => ({
        url: API_ENDPOINTS.report.create,
        method: 'POST',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Report', id: 'LIST' }, { type: 'Report', id: 'OPEN' }],
    }),

    deleteReport: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.delete(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
        { type: 'Report', id: 'OPEN' },
      ],
    }),

    closeReport: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.close(id),
        method: 'PUT',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
        { type: 'Report', id: 'OPEN' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetReportsQuery,
  useGetReportQuery,
  useGetReportsFilterQuery,
  useGetReportsByReporterQuery,
  useGetOpenReportsQuery,
  useGetReportReasonTypesQuery,
  useGetReportReasonTypeByIdQuery,
  useGetReportReasonTypesByEntityTypeQuery,
  useGetReportEntityTypesQuery,
  useGetReportEntityTypeByIdQuery,
  useCreateReportMutation,
  useDeleteReportMutation,
  useCloseReportMutation,
} = reportApi;

