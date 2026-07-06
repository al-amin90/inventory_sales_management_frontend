import { baseApi } from "../../api/baseApi";
import { dynamicTag } from "../../utils/dynamicTag";

const dynamicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDynamic: builder.query<
      { success: boolean; message: string; data: any; meta?: any },
      { url: string; params?: Record<string, any> }
    >({
      query: ({ url, params }) => ({ url, params, method: "GET" }),
      providesTags: dynamicTag,
    }),

    postDynamic: builder.mutation({
      query: ({ url, data }) => ({ url, method: "POST", body: data }),

      invalidatesTags: (_result, _error, arg) =>
        arg.invalidatesTags || dynamicTag(_result, _error, arg),
    }),

    patchDynamic: builder.mutation({
      query: ({ url, data }) => ({ url, method: "PATCH", body: data }),

      invalidatesTags: dynamicTag,
    }),

    deleteDynamic: builder.mutation({
      query: ({ url }) => ({ url, method: "DELETE" }),

      invalidatesTags: dynamicTag,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDynamicQuery,
  useLazyGetDynamicQuery,
  usePostDynamicMutation,
  usePatchDynamicMutation,
  useDeleteDynamicMutation,
} = dynamicApi;
