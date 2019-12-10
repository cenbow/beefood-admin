import {
  getCityDeliveryList,
  addCityDelivery,
  editCityDelivery,
  getCityDeliveryInfo,
  deleteCityDelivery,
} from '@/services/config';

const data = {
  list: [],
  pagination: {},
}

export default {
  namespace: 'configDelivery',

  state: {
    list: data,
  },

  effects: {
    *fetchCityDeliveryList({ payload }, { call, put }) {
      const response = yield call(getCityDeliveryList, payload);
      yield put({
        type: 'cityDeliveryList',
        payload: response.data,
      });
    },
    *addCityDelivery({ payload, callback }, { call }) {
      const response = yield call(addCityDelivery, payload);
      if (callback) callback(response);
    },
    *editCityDelivery({ payload, callback }, { call }) {
      const response = yield call(editCityDelivery, payload);
      if (callback) callback(response);
    },
    *fetchCityDeliveryInfo({ payload, callback }, { call }) {
      const response = yield call(getCityDeliveryInfo, payload);
      if (callback) callback(response);
    },
    *deleteCityDelivery({ payload, callback }, { call }) {
      const response = yield call(deleteCityDelivery, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    cityDeliveryList(state, { payload }) {
      return {
        ...state,
        list: {
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
