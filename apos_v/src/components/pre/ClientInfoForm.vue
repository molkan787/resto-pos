<template>
    <div class="ui form">
        <div class="inline fields">
            <div class="nine wide field">
                <label>Name</label>
                <sui-input v-model="data.first_name" placeholder="First Name" icon="user"/>
            </div>
            <div class="seven wide field">
                <sui-input v-model="data.last_name" placeholder="Last Name" icon="user"/>
            </div>
        </div>
        <div class="inline fields">
            <div class="nine wide field">
                <label>Phone</label>
                <PhoneInput v-model="data.phone" :loading="phoneInputLoading" placeholder="Phone number" icon="phone" />
            </div>
            <div class="seven wide field" style="opacity: 0;pointer-events: none;">
                <sui-input placeholder="" icon="user"/>
            </div>
        </div>
        <template v-if="showAddress">
            <hr style="margin-bottom: 1rem;">
            <div class="inline fields">
                <div class="nine wide field">
                    <label class="address-label">Address</label>
                    <sui-input v-model="data.address_1" placeholder="Address Line 1" icon="address" />
                </div>
                <div class="seven wide field">
                    <sui-input v-model="data.address_2" placeholder="Address Line 2" icon="address" />
                </div>
            </div>
            <div class="inline fields">
                <div class="nine wide field">
                    <label style="opacity: 0">City</label>
                    <sui-input v-model="data.postcode" placeholder="Post Code" icon="address" />
                </div>
                <div class="seven wide field">
                    <sui-input v-model="data.city" placeholder="City" icon="address" />
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import PhoneInput from './PhoneInput.vue'
import ClientLoader from '@/prs/clientLoader';
import debounce from 'debounce';

@Component({
    components: {
        PhoneInput,
    },
    watch: {
        'data.phone'(){
            if(this.autoLoadClient && this.data.phone.length == 11){
                this._tryLoadClient();
            }
        }
    }
})
export default class ClientInfoForm extends Vue{

    private _tryLoadClient: Function = null;

    @Prop({default: () => ({
            phone: '',
            first_name: '',
            last_name: ''
        }) }) data!: any;

    @Prop({default: false})
    showAddress!: Boolean;
    
    @Prop({default: false})
    autoLoadClient!: Boolean;

    private phoneInputLoading: boolean = false;

    async tryLoadClient(){
        this.phoneInputLoading = true;
        try{
            const client = await ClientLoader.loadClient(this.data.phone, false);
            this.data.first_name = client.first_name || '';
            this.data.last_name = client.last_name || '';
        }catch(error){
            
        }
        this.phoneInputLoading = false;
    }

    created(){
        this._tryLoadClient = debounce(() => this.tryLoadClient(), 200);
    }

}
</script>


<style lang="scss" scoped>
.field > label{
    font-size: 1.3rem !important;
    width: 6rem !important;
}
.address-label{
    margin: 0 0.8em 0 0 !important;
}
</style>
