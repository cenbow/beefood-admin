import { stringify } from 'qs';
import { queryProjectNotice } from '@/services/api';
import {
  getSalesOperation,
  getTimeOrderStatistice,
  getMerchantOrderStatistics,
  getBonusList,
  getRegionList,
  getPayOrderList,
  getNewUserList,
  getFirstBuyUserList
} from '@/services/statistics';

export default {
  namespace: 'statistics',

  state: {
    data: {},
    notice: [],
    salesOperation: {},
    timeOrderStatistice: [],
    merchantOrderStatistics: [],
    bonusList: [],
    regionList: [],
    payOrderList: [],
    newUserList: [],
    firstBuyUserList: [],
  },

  effects: {
    *fetchSalesOperation({ payload }, { call, put }) {
      const response = yield call(getSalesOperation, payload);
      yield put({
        type: 'salesOperation',
        payload: response.data.items,
      });
    },
    *fetchTimeOrderStatistice({ payload }, { call, put }) {
      const response = yield call(getTimeOrderStatistice, payload);
      yield put({
        type: 'timeOrderStatistice',
        payload: response.data,
      });
    },
    *fetchMerchantOrderStatistics({ payload }, { call, put }) {
      const response = yield call(getMerchantOrderStatistics, payload);
      yield put({
        type: 'merchantOrderStatistics',
        payload: response.data,
      });
    },
    *fetchNotice({ payload }, { call, put }) {
      const response = yield call(queryProjectNotice, payload);
      yield put({
        type: 'saveNotice',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *fetchBonusList({ payload }, { call, put }) {
      const response = yield call(getBonusList, payload);
      yield put({
        type: 'bonusList',
        payload: response.data,
      });
    },
    *fetchRegionList({ payload }, { call, put }) {
      const response = yield call(getRegionList, payload);
      yield put({
        type: 'regionList',
        payload: response.data,
      });
    },
    *fetchPayOrderList({ payload }, { call, put }) {
      const response = yield call(getPayOrderList, payload);
      yield put({
        type: 'payOrderList',
        payload: response.data,
      });
    },
    *fetchNewUserList({ payload }, { call, put }) {
      const response = yield call(getNewUserList, payload);
      yield put({
        type: 'newUserList',
        payload: response.data,
      });
    },
    *fetchFirstBuyUserList({ payload }, { call, put }) {
      const response = yield call(getFirstBuyUserList, payload);
      yield put({
        type: 'firstBuyUserList',
        payload: response.data,
      });
    },
  },

  reducers: {
    salesOperation(state, action) {
      return {
        ...state,
        salesOperation: action.payload,
      };
    },
    merchantOrderStatistics(state, action) {
      return {
        ...state,
        merchantOrderStatistics: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    timeOrderStatistice(state, action) {
      return {
        ...state,
        timeOrderStatistice: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    saveNotice(state, action) {
      return {
        ...state,
        notice: action.payload,
      };
    },
    bonusList(state, action) {
      return {
        ...state,
        bonusList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    regionList(state, action) {
      return {
        ...state,
        regionList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    payOrderList(state, action) {
      return {
        ...state,
        payOrderList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    newUserList(state, action) {
      return {
        ...state,
        newUserList: {
          list: action.payload.items,
          pagination: {
            total: action.payload.total,
            pageSize: action.payload.pagesize,
            current: action.payload.page,
          },
        },
      };
    },
    firstBuyUserList(state, action) {
      return {
        ...state,
        firstBuyUserList: {
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
