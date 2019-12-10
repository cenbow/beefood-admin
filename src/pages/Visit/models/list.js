import { getOrderList, getOrderDetails, getOrderTrace } from '@/services/order';
import { queryAdminVisit, queryAdminVisitSave, queryAdminPath, deleteVisit, getVisitDetail } from '@/services/visit';

export default {
    namespace: 'visit',

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
        responseCode: {},
    },

    effects: {
        //拜访管理-列表
        *fetchAdminVisit ({ payload }, { call, put }) {
            const response = yield call(queryAdminVisit, payload);
            yield put({
                type: 'saveList',
                payload: response,
            });
        },
        //拜访管理-拜访路径
        *fetchAdminPath ({ payload, callback }, { call, put }) {
            const response = yield call(queryAdminPath, payload);
            console.log(response);
            if (callback) callback(response);
            // yield put({
            //   type: 'saveList',
            //   payload: response,
            // });
        },
        //拜访管理-添加/修改
        *adminVisitSave ({ payload, callback }, { call, put }) {
            const response = yield call(queryAdminVisitSave, payload);
            if (callback) callback(response);
        },
        *fetchOrderDetails ({ payload }, { call, put }) {
            const response = yield call(getOrderDetails, payload);
            yield put({
                type: 'saveDetails',
                payload: response,
            });
        },
        *fetchOrderTrace ({ payload }, { call, put }) {
            const response = yield call(getOrderTrace, payload);
            yield put({
                type: 'saveOrderTrace',
                payload: response,
            });
        },
        *fetchVisitDelete ({ payload, callback }, { call }) {
            const response = yield call(deleteVisit, payload);
            if (callback) callback(response);
        },
        *fetchVisitDetails ({ payload }, { call, put }) {
            const response = yield call(getVisitDetail, payload);
            yield put({
                type: 'visitDetails',
                payload: response.data,
            });
        },
    },

    reducers: {
        saveList (state, action) {
            return {
                ...state,
                data: {
                    list: action.payload.data.items,
                    pagination: {
                        total: action.payload.data.total,
                        pageSize: action.payload.data.pagesize,
                        current: action.payload.data.page,
                    },
                },
            };
        },
        saveDetails (state, action) {
            return {
                ...state,
                details: action.payload.data.items,
            };
        },
        visitDetails (state, { payload }) {
            return {
                ...state,
                visitDetails: payload.items
            };
        },
        saveOrderTrace (state, action) {
            return {
                ...state,
                orderTrace: {
                    list: action.payload.data.items,
                    pagination: {
                        total: action.payload.total,
                        pageSize: action.payload.pagesize,
                        current: action.payload.page,
                    },
                },
            };
        },
        saveResponseCode (state, action) {
            console.log(action.payload);
            return {
                ...state,
                responseCode: action.payload,
            };
        },
    },
};
