import { getDriverDeliverStatistics, getDriverDeliverStatisticsDetails } from '@/services/deliveryman';

let data = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'deliverymanStatisticsList',

  state: {
    statisticsListData: data,
    statisticsDetailsListData: data,
  },

  effects: {
    // consumer
    *fetchStatisticsList({ payload }, { call, put }) {
      const response = yield call(getDriverDeliverStatistics, payload);
      yield put({
        type: 'statisticsListSave',
        payload: response.data,
      });
    },
    *fetchStatisticsDetails({ payload }, { call, put }) {
      const response = yield call(getDriverDeliverStatisticsDetails, payload);
      yield put({
        type: 'statisticsDetails',
        payload: response.data,
      });
    },
  },

  reducers: {
    statisticsListSave(state, action) {
      return {
        ...state,
        statisticsListData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
    statisticsDetails(state, action) {
      return {
        ...state,
        statisticsDetailsListData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
  },
};
