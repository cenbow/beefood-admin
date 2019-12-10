import { getStationAgent, getStationAgentInfo, getStationAgentDetail, saveStationAgent, editStationAgent, deleteStationAgent, getStationAgentDriverList } from '@/services/stationMaster';


export default {
  namespace: 'stationMaster',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    details: {},
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(getStationAgent, payload);
      yield put({
        type: 'saveList',
        payload: response.data,
      });
    },
    *fetchSave({ payload, callback }, { call }) {
      const response = yield call(saveStationAgent, payload);
      if (callback) callback(response);
    },
    *fetchEdit({ payload, callback }, { call }) {
      const response = yield call(editStationAgent, payload);
      if (callback) callback(response);
    },
    *fetchDelete({ payload, callback }, { call }) {
      const response = yield call(deleteStationAgent, payload);
      if (callback) callback(response);
    },
    *fetchDetails({ payload }, { call, put }) {
      const response = yield call(getStationAgentDetail, payload);
      yield put({
        type: 'details',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveList(state, { payload }) {
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
    details(state, { payload }) {
      return {
        ...state,
        details: payload.items
      };
    },
  },
};
