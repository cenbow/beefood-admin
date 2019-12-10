import { getStationList, getStationDetail, saveStation, editStation, deleteStation, takeRange } from '@/services/station';


export default {
  namespace: 'station',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    stationDetails: {},
  },

  effects: {
    *fetchStationList({ payload }, { call, put }) {
      const response = yield call(getStationList, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchStationSave({ payload, callback }, { call }) {
      const response = yield call(saveStation, payload);
      if (callback) callback(response);
    },
    *fetchStationEdit({ payload, callback }, { call }) {
      const response = yield call(editStation, payload);
      if (callback) callback(response);
    },
    *fetchStationDelete({ payload, callback }, { call }) {
      const response = yield call(deleteStation, payload);
      if (callback) callback(response);
    },
    *fetchStationDetails({ payload, callback }, { call, put }) {
      const response = yield call(getStationDetail, payload);
      yield put({
        type: 'stationDetails',
        payload: response.data,
      });
      if (callback) callback(response);
    },
    *fetchTakeRange({ payload, callback }, { call }) {
      const response = yield call(takeRange, payload);
      if (callback) callback(response);
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
    stationDetails(state, { payload }) {
      return {
        ...state,
        stationDetails: payload.items
      };
    },
  },
};
