<template>
    <div class="ui segment">
        <h2>Sync with online ordering system</h2>
        <hr>
        <div class="row">
            <div class="column">
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
            <div class="column">
                <sui-button :disabled="!murewConnected" class="save-btn" icon="arrow up" color="blue" :loading="uploadingMenu" @click="uploadMenuClick">
                    Upload Menu
                </sui-button>
                <br>
                <sui-button :disabled="!murewConnected" class="save-btn" icon="arrow down" color="blue" :loading="pullingMenu" @click="pullMenuClick">
                    Pull Menu
                </sui-button>
            </div>
        </div>
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
        uploadingMenu: false,
        pullingMenu: false,
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
        },
        murewConnected(){
            return services.instances.murew.status == 'connected';
        }
    },
    methods: {
        async uploadMenuClick(){
            if(await quickAsk('Uploading menu will delete any existing categories and items in the online service, and replace it with the data from this POS.\n\nDo you want to continue?', 'WARNING')){
                this.uploadingMenu = true
                services.instances.murewSync.sendMenu()
                await new Promise(r => setTimeout(r, 5000))
                this.uploadingMenu = false
            }
        },
        async pullMenuClick(){
            if(await quickAsk('Pulling menu will delete any existing categories and items in this POS app, and replace it with the data from online service.\n\nDo you want to continue?', 'WARNING')){

            }
        },
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

<style lang="scss" scoped>
.segment{
    text-align: left;
}
.row{
    display: flex;
    flex-direction: row;
    .column{
        &:first-child{
            flex: 1;
        }
        &:last-child{
            display: flex;
            flex-direction: column;
        }
    }
}
</style>