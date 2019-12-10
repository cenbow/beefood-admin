import {
  queryMemberConsumer,
  queryMemberConsumerInfo,
  memberConsumerAdd,
  memberConsumerUpdate,
  memberConsumerDelete,
  getBonusValueList,
  bonusValueInfo,
  bonusValueDelete,
  getAddressList,
  memberAddressAdd,
  memberAddressInfo,
  memberAddressUpdate,
  memberAddressDelete,
  getOrderList,
  getOrderServiceList,
} from '@/services/member';

const listData = {
  list: [],
  pagination: {},
};

export default {
  namespace: 'member',

  state: {
    data: listData,
    details: {},
    userOrderList: listData,
    serviceOrderList: listData,
    foundLogList: listData,
    bonusValueList: listData,
    addressList: listData,
  },

  effects: {
    *fetchConsumerList({ payload }, { call, put }) {
      const response = yield call(queryMemberConsumer, payload);
      yield put({
        type: 'consumerList',
        payload: response.data,
      });
    },
    *fetchConsumerAdd({ payload, callback }, { call }) {
      const response = yield call(memberConsumerAdd, payload);
      if (callback) callback(response);
    },
    *fetchConsumerUpdate({ payload, callback }, { call }) {
      const response = yield call(memberConsumerUpdate, payload);
      if (callback) callback(response);
    },
    *fetchConsumerDelete({ payload, callback }, { call }) {
      const response = yield call(memberConsumerDelete, payload);
      if (callback) callback(response);
    },
    *fetchMemberConsumerInfo({ payload, callback }, { call, put }) {
      const response = yield call(queryMemberConsumerInfo, payload);
      yield put({
        type: 'showDetails',
        payload: response.data
      });
      if (callback) callback(response);
    },
    *fetchUserOrderList({ payload }, { call, put }) {
      const response = yield call(getOrderList, payload);
      yield put({
        type: 'userOrderList',
        payload: response.data
      });
    },
    *fetchServiceOrderList({ payload }, { call, put }) {
      const response = yield call(getOrderServiceList, payload);
      yield put({
        type: 'serviceOrderList',
        payload: response.data
      });
    },
    *fetchBonusValueList({ payload }, { call, put }) {
      const response = yield call(getBonusValueList, payload);
      yield put({
        type: 'bonusValueList',
        payload: response.data
      });
    },
    *fetchBonusValueInfo({ payload, callback }, { call, put }) {
      const response = yield call(bonusValueInfo, payload);
      yield put({
        type: 'bonusValueInfo',
        payload: response.data
      });
    },
    *fetchBonusValueDelete({ payload, callback }, { call }) {
      const response = yield call(bonusValueDelete, payload);
      if (callback) callback(response);
    },
    *fetchAddressList({ payload }, { call, put }) {
      const response = yield call(getAddressList, payload);
      yield put({
        type: 'addressList',
        payload: response.data
      });
    },
    *fetchAddressInfo({ payload, callback }, { call, put }) {
      const response = yield call(memberAddressInfo, payload);
      if (callback) callback(response);
    },
    *fetchAddressAdd({ payload, callback }, { call }) {
      const response = yield call(memberAddressAdd, payload);
      if (callback) callback(response);
    },
    *fetchAddressUpdate({ payload, callback }, { call }) {
      const response = yield call(memberAddressUpdate, payload);
      if (callback) callback(response);
    },
    *fetchAddressDelete({ payload, callback }, { call }) {
      const response = yield call(memberAddressDelete, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    consumerList(state, { payload }) {
      return {
        ...state,
        data: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    bonusValueInfo(state, { payload }) {
      return {
        ...state,
        details: payload.items,
      };
    },
    showDetails(state, { payload }) {
      return {
        ...state,
        details: payload.items,
      };
    },
    userOrderList(state, { payload }) {
      return {
        ...state,
        userOrderList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    serviceOrderList(state, { payload }) {
      return {
        ...state,
        serviceOrderList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    bonusValueList(state, { payload }) {
      return {
        ...state,
        bonusValueList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
    addressList(state, { payload }) {
      return {
        ...state,
        addressList: {
          list: payload.items,
          pagination: {
            total: payload.total,
            pageSize: payload.pagesize,
            current: payload.page,
          },
        }
      };
    },
  },
};
