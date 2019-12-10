import { getOrderServiceList, getOrderDetails, getOrderServiceDetails, dealOrderReturnApply } from '@/services/order';


export default {
  namespace: 'orderServiceList',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    details: {},
    serviceInfo: {},
  },

  effects: {
    *fetchOrderList({ payload }, { call, put }) {
      const response = yield call(getOrderServiceList, payload);
      yield put({
        type: 'saveList',
        payload: response,
      });
    },
    *fetchOrderDetails({ payload }, { call, put }) {
      const response = yield call(getOrderDetails, payload);
      yield put({
        type: 'saveDetails',
        payload: response,
      });
    },
    *fetchOrderServiceDetails({ payload }, { call, put }) {
      const response = yield call(getOrderServiceDetails, payload);
      yield put({
        type: 'saveServiceDetails',
        payload: response,
      });
    },
    *fetchDealOrderReturnApply({ payload, callback }, { call }) {
      const response = yield call(dealOrderReturnApply, payload);
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: {
          list: action.payload.data.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        }
      };
    },
    saveDetails(state, action) {
      return {
        ...state,
        details: action.payload.data.items
      };
    },
    saveServiceDetails(state, action) {
      return {
        ...state,
        serviceInfo: action.payload.data.items
      };
    },
  },
};
