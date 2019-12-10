import { getHomeInfo, getOrderFailList, getOrderRefundList, getMerchantAuditList, getFeedbackMerchantList, getFeedbackUserList, getFeedbackDriverList } from '@/services/home';

const data = {
  list: [],
  pagination: {
    total: 0,
    pageSize: 0,
    current: 1,
  },
}

export default {
  namespace: 'home',

  state: {
    homeInfo: {},
    orderFailData: {},
    orderRefundData: {},
    merchantAuditData: {},
    feedbackMerchantData: {},
    feedbackUserData: {},
    feedbackDriverData: {},
  },

  effects: {
    *fetchHomeInfo({ payload }, { call, put }) {
      const response = yield call(getHomeInfo, payload);
      yield put({
        type: 'homeInfo',
        payload: response.data,
      });
    },
    *fetchOrderFailList({ payload }, { call, put }) {
      const response = yield call(getOrderFailList, payload);
      yield put({
        type: 'orderFailData',
        payload: response.data,
      });
    },
    *fetchOrderRefundList({ payload }, { call, put }) {
      const response = yield call(getOrderRefundList, payload);
      yield put({
        type: 'orderRefundData',
        payload: response.data,
      });
    },
    *fetchMerchantAuditList({ payload }, { call, put }) {
      const response = yield call(getMerchantAuditList, payload);
      yield put({
        type: 'merchantAuditData',
        payload: response.data,
      });
    },
    *fetchFeedbackMerchantList({ payload }, { call, put }) {
      const response = yield call(getFeedbackMerchantList, payload);
      yield put({
        type: 'feedbackMerchantData',
        payload: response.data,
      });
    },
    *fetchFeedbackUserList({ payload }, { call, put }) {
      const response = yield call(getFeedbackUserList, payload);
      yield put({
        type: 'feedbackUserData',
        payload: response.data,
      });
    },
    *fetchFeedbackDriverList({ payload }, { call, put }) {
      const response = yield call(getFeedbackDriverList, payload);
      yield put({
        type: 'feedbackDriverData',
        payload: response.data,
      });
    },
  },

  reducers: {
    homeInfo(state, { payload }) {
      return {
        ...state,
        homeInfo: payload.items,
      };
    },
    orderFailData(state, action) {
      return {
        ...state,
        orderFailData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    orderRefundData(state, action) {
      return {
        ...state,
        orderRefundData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    merchantAuditData(state, action) {
      return {
        ...state,
        merchantAuditData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    feedbackMerchantData(state, action) {
      return {
        ...state,
        feedbackMerchantData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    feedbackUserData(state, action) {
      return {
        ...state,
        feedbackUserData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    feedbackDriverData(state, action) {
      return {
        ...state,
        feedbackDriverData: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
  },
};
