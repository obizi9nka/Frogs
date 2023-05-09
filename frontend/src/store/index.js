import {createStore} from "vuex";
import {userModule} from "@/store/userModule";
import {adminModule} from "@/store/adminModule";

export default createStore({
    state: () => ({
        account: 0x0,
        chain: 0x0
    }),
    getters: {

    },
    mutations: {
        setAccount(state, account){
            state.account = account
        },
        setChain(state, chain){
            state.chain = chain
        }
    },
    actions: {

    },
    modules: {
        user: userModule,
        admin: adminModule
    }
})