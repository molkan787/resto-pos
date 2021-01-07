<template>
    <div class="ui segment">
        <h2>Sync with online ordering system</h2>
        <hr>
        <LabeledInput class="input" label="Sync Key" v-model="syncKey" :disabled="loading"/> <br> <br>
        <div>
            <table v-if="keyData">
                <tbody>
                    <tr>
                        <td>Backend URL:</td>
                        <td><b>{{ keyData.endpoint }}</b></td>
                    </tr>
                    <tr>
                        <td>Store Name:</td>
                        <td><b>{{ keyData.store_name }}</b></td>
                    </tr>
                </tbody>
            </table>
            <div v-else>
                {{ syncKey ? 'Invalid Key' : 'No key, The POS will not sync with online ordering system' }}
            </div>
            <br>
        </div>
        <sui-button class="save-btn" icon="save" color="blue" :loading="loading" @click="saveClick">
            Save & connect
        </sui-button>
    </div>
</template>

<script>
import LocalSetting from '@/prs/localSettings';
import LabeledInput from '../Elts/inputs/LabeledInput.vue';
import { MurewService, MUREW_SYNC_KEY_LSK } from '@/services/murew';
import { services } from '@/services';
export default {
    components: {
        LabeledInput
    },
    data: () => ({
        loading: false,
        syncKey: '',
    }),
    computed: {
        keyData(){
            if(this.syncKey){
                try {
                    const rawJson = atob(this.syncKey);
                    return JSON.parse(rawJson);
                } catch (error) {
                    
                }
            }
            return null;
        }
    },
    methods: {
        async saveClick(){
            LocalSetting.setItem(MUREW_SYNC_KEY_LSK, this.syncKey);
            if(this.keyData){ // the key is valid
                this.loading = true;
                try {
                    await services.instances.murew.connect();
                    info('POS successfully connected to syncing service!', 'Success!').then(e => e.hide());
                } catch (error) {
                    console.error(error);
                    info('Connecting to syncing service failed', 'Error').then(e => e.hide());
                }
                this.loading = false;
            }else{ // the key is invalid or empty
                services.instances.murew.disconnect();
                info('POS disconnected from syncing service.').then(e => e.hide());
            }
        }
    },
    mounted(){
        this.syncKey = LocalSetting.getItem(MUREW_SYNC_KEY_LSK) || '';
    }
}
</script>

<style scoped>
.segment{
    text-align: left;
}
</style>