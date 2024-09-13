// store.js
import {createStore} from 'vuex';

const store = createStore({
    state: {
        session: null, // This will hold your session data
    },
    mutations: {
        setSession(state, sessionData) {
            state.session = sessionData;
        },
        clearSession(state) {
            state.session = null;
        },
        updateUserName(state, newName) {
            if (state.session && state.session.user) {
                state.session.user.name = newName;
            }
        },
        updateSession(state, additionalData) {
            if (state.session) {
                state.session = {...state.session, ...additionalData};
            }
        }

    },
    actions: {
        startSession({commit}, sessionData) {
            commit('setSession', sessionData);
        },
        endSession({commit}) {
            commit('clearSession');
        },
        changeUserName({commit}, newName) {
            commit('updateUserName', newName);
        },
        addSessionData({commit}, additionalData) {
            commit('updateSession', additionalData);
        },
    },
    getters: {
        getSession(state) {
            return state.session;
        },
    },
});

export default store;
