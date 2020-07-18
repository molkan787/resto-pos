import DataManager from './data-manager';
import axios from 'axios';
import store from '../store';
import router from '../router';

export default class Session{

    static loadState(){
        const token = localStorage.getItem('auth_token');
        if(token){
            const state = store.state.session;
            state.token = token;
            state.signedIn = true;
            this.useToken(token);
            this.checkAuthState();
            router.replace('/vendors');
        }else{
            router.replace('/login');
        }
    }

    static async checkAuthState(){
        try {
            const url = `${DataManager.API_BASE_URL}/check`;
            await axios.get(url);
        } catch (error) {

        }
    }

    static logout(){
        window.localStorage.removeItem('auth_token');
        window.location.reload();
    }

    static async login(username, password){
        try {
            const url = `${DataManager.API_BASE_URL}/auth`;
            const { data } = await axios.post(url, {
                username,
                password,
            });
            this._setSession(data);
            return true;
        } catch (error) {
            console.error(error);
            if(error.response && error.response.status == 401){
                return false;
            }else{
                throw error;
            }
        }
    }

    static _setSession(data){
        const state = store.state.session;
        const { token } = data;
        state.token = token;
        state.signedIn = true;
        window.localStorage.setItem('auth_token', token);
        this.useToken(token);
    }

    static useToken(token){
        axios.defaults.headers.common['Authorization'] = token;
    }

}

axios.interceptors.response.use(resp => resp, error => {
    console.log(error)
    if(error.response && error.response.status == 401){
        try {
            store.state.session.signedIn = false;
            window.localStorage.removeItem('auth_token');
            router.replace('/login');
        } catch (error) { 
        }
    }else{
        return Promise.reject(error);
    }
})