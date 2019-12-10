import { getOrderList, getOrderDetails, getOrderTrace, orderCancel } from '@/services/order';


export default {
  namespace: 'orderList',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    details: {},
    orderTrace: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchOrderList({ payload }, { call, put }) {
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchOrderDetails({ payload }, { call, put }) {
      const response = yield call(getOrderDetails, payload);
      yield put({
        type: 'saveDetails',
        payload: response.data,
      });
    },
    *fetchOrderCancel({ payload, callback }, { call }) {
      const response = yield call(orderCancel, payload);
      if (callback) callback(response);
    },
    *fetchOrderTrace({ payload }, { call, put }) {
      const response = yield call(getOrderTrace, payload);
      yield put({
        type: 'saveOrderTrace',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: {
          list: action.payload.items,
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
        details: action.payload.items
      };
    },
    saveOrderTrace(state, action) {
      return {
        ...state,
        orderTrace: {
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
