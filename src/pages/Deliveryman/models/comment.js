import {
  getDriverCommentList,
  getMerchantCommentList,
  getEvaluateLabelList,
  getEvaluateLabelInfo,
  getEvaluateLabelAdd,
  getEvaluateLabelEdit,
  getEvaluateLabelDelete,
} from '@/services/deliveryman';

let dataList = {
  list: [],
  pagination: {},
};

export default {
  namespace: 'deliverymanComment',

  state: {
    driverCommentList: dataList,
  },

  effects: {
    *fetchDriverComment({ payload }, { call, put }) {
      const response = yield call(getDriverCommentList, payload);
      yield put({
        type: 'getDriverCommentList',
        payload: response.data,
      });
    },
    *fetchMerchantComment({ payload }, { call, put }) {
      const response = yield call(getMerchantCommentList, payload);
      yield put({
        type: 'getMerchantCommentList',
        payload: response.data,
      });
    },
    *fetchEvaluateLabelList({ payload }, { call, put }) {
      const response = yield call(getEvaluateLabelList, payload);
      yield put({
        type: 'getEvaluateLabelList',
        payload: response.data,
      });
    },
    *fetchEvaluateLabelAdd({ payload, callback }, { call }) {
      const response = yield call(getEvaluateLabelAdd, payload);
      if (callback) callback(response);
    },
    *fetchEvaluateLabelInfo({ payload, callback }, { call, put }) {
      const response = yield call(getEvaluateLabelInfo, payload);
      yield put({
        type: 'showDetails',
        payload: response.data
      });
      if (callback) callback(response);
    },
    *fetchEvaluateLabelEdit({ payload, callback }, { call }) {
      const response = yield call(getEvaluateLabelEdit, payload);
      if (callback) callback(response);
    },
    *fetchEvaluateLabelDelete({ payload, callback }, { call }) {
      const response = yield call(getEvaluateLabelDelete, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    getDriverCommentList(state, { payload }) {
      return {
        ...state,
        driverCommentList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    getMerchantCommentList(state, { payload }) {
      return {
        ...state,
        merchantCommentList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    getEvaluateLabelList(state, { payload }) {
      return {
        ...state,
        evaluateLabelList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        },
      };
    },
    showDetails(state, { payload }) {
      return {
        ...state,
        details: payload.items,
      };
    },
  },
};
