<template>
    <div class="ui horizontal segments">
        <div class="ui vertical segments segment">
            <div class="ui segment">
                <h2>Receipt informations</h2>
                <hr>
                <div class="ui form">
                    <div class="two fields">
                        <sui-form-field :disabled="loading">
                            <label>Restaurant Name</label>
                            <input v-model="allSettings.store_name" type="text">
                        </sui-form-field>
                        <sui-form-field :disabled="loading">
                            <label>Restaurant Phone</label>
                            <input v-model="allSettings.store_phone" type="text">
                        </sui-form-field>
                    </div>
                    <sui-form-field>
                        <label>Restaurant Address</label>
                        <div class="two fields">
                            <sui-form-field :disabled="loading">
                                <label>Line 1</label>
                                <input v-model="allSettings.store_address.line1" type="text">
                            </sui-form-field>
                            <sui-form-field :disabled="loading">
                                <label>City</label>
                                <input v-model="allSettings.store_address.city" type="text">
                            </sui-form-field>
                        </div>
                        <div class="two fields">
                            <sui-form-field :disabled="loading">
                                <label>Line 2</label>
                                <input v-model="allSettings.store_address.line2" type="text">
                            </sui-form-field>
                            <sui-form-field :disabled="loading">
                                <label>Postcode</label>
                                <input v-model="allSettings.store_address.postcode" type="text">
                            </sui-form-field>
                        </div>
                        <div class="field">
                            <label>Custom Message</label>
                            <textarea v-model="allSettings.receipt_message" style="resize:none" cols="30" rows="4" placeholder="This message will be printed at the end of the receipt"></textarea>
                        </div>
                    </sui-form-field>
                </div>
            </div>
            <div class="ui segment">
                <h2>POS</h2> <hr>
                <div class="ui form">
                    <div class="two fields">
                        <sui-form-field :disabled="loading">
                            <label>Number of Tables</label>
                            <input v-model="allSettings.tables_count" type="text">
                        </sui-form-field>
                        <sui-form-field :disabled="loading">
                            <label>Number of Persons per Table</label>
                            <input v-model="allSettings.persons_per_table" type="text">
                        </sui-form-field>
                    </div>
                    <sui-form-field :disabled="loading">
                        <label>Enabled order types</label>
                        <div class="input checks-parent">
                            <sui-checkbox v-model="allSettings.order_types.table" :disabled="loading" label="Table Order" />
                            <sui-checkbox v-model="allSettings.order_types.delivery" :disabled="loading" label="Delivery Order" />
                            <sui-checkbox v-model="allSettings.order_types.collection" :disabled="loading" label="Collection Order" />
                        </div>
                    </sui-form-field>
                </div>
            </div>
            <div class="ui segment">
                <sui-button class="save-btn" icon="save" color="blue" :loading="loading" @click="saveClick">Save all</sui-button>
            </div>
        </div>
        <div class="ui segment right">
            <h2>
                Bookings Slots
                <sui-button class="save-bs-btn" icon="save" color="blue" :loading="loading2" @click="saveBookingSlotsClick">Save</sui-button>
            </h2>
            <div class="booking-slots">
                <div v-for="day in days" :key="day" class="booking-slot-day">
                    <h4>{{ day }}</h4>
                    <sui-dropdown
                        multiple
                        fluid
                        :options="timeOptions"
                        placeholder="Time slots (hh:mm 24h format)"
                        search
                        selection
                        allow-additions
                        v-model="bookingSlots[day]"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import DM from '@/prs/dm';
import {mapState} from 'vuex';
import Message from '@/ccs/Message';
import LabeledInput from '../Elts/inputs/LabeledInput.vue';

@Component({
    components: {
        LabeledInput,
    },
    computed: mapState(['vat_number', 'tables_count', 'persons_per_table', 'order_types', 'sharedSettings']),
    watch: {
        'allSettings.tables_count'(tc){
            this.$nextTick().then(() => {
                if(tc < 1){
                    this.allSettings.tables_count = 1;
                }else if(tc > 1000){
                    this.allSettings.tables_count = 1000;
                }
            })
        },
        'bookingSlots.Monday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Monday')
            }
        },
        'bookingSlots.Tuesday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Tuesday')
            }
        },
        'bookingSlots.Wednesday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Wednesday')
            }
        },
        'bookingSlots.Thursday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Thursday')
            }
        },
        'bookingSlots.Friday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Friday')
            }
        },
        'bookingSlots.Saturday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Saturday')
            }
        },
        'bookingSlots.Sunday': {
            deep: true,
            handler(){
                this.validateTimeSlotsTimeFormat('Sunday')
            }
        },
    }
})
export default class SettingTab extends Vue{
    private allSettings: ant = {};
    
    private bookingSlots = {};

    private loading: boolean = false;
    private successText: boolean = false;
    private loading2: boolean = false;

    private days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];
    private timeOptions: [];

    saveClick(){
        if(this.validateForm()){
            this.loading = true;
            this.save();
        }
    }

    validateForm(){
        const { table, delivery, collection } = this.allSettings.order_types;
        const isValid = table || delivery || collection;
        if(!isValid){
            info('Please select at least one order type.').then(e => e.hide());
        }
        return isValid;
    }

    save(){
        DM.editSettings(this.allSettings)
        .then(() => {
            this.showSuccessText();
        }).catch(err => {
            Message.info('We could not complete the current action');
        }).finally(() => this.loading = false);
    }

    loadValues(){
        const settings = Object.clone(this.sharedSettings);
        this.allSettings = {
            vat_number: '',
            tables_count: 10,
            persons_per_table: 4,
            order_types: {
                collection: true,
                delivery: true,
                table: true,
            },
            store_address: {
                line1: '',
                line2: '',
                postcode: '',
                city: ''
            },
            receipt_message: '',
            ...settings
        }
    }

    showSuccessText(){
        this.$toastr.i('Changes were saved!')
    }

    async saveBookingSlotsClick(){
        this.loading2 = true;
        try {
            await DM.setBookingSlots(this.bookingSlots);
            this.$toastr.i('Booking slots were saved!');
        } catch (error) {
            console.error(error);
            this.$toastr.e('Something went wrong, please try again.');
        }
        this.loading2 = false;
    }

    validateTimeSlotsTimeFormat(day){
        const slots = this.bookingSlots[day];
        if(slots instanceof Array){
            for(let i = slots.length - 1; i >= 0; i--){
                const t = slots[i];
                const ft = this.isValideTimeFormat(t);
                if(typeof ft == 'string'){
                    if(ft !== t){
                        slots[i] = ft;
                    }
                }else{
                    slots.splice(i, 1);
                }
            }
        }
    }

    isValideTimeFormat(value: string){
        if(value.length < 3 || value.length > 5) return false;
        const [_hh, _mm] = value.split(':');
        const hh = parseInt(_hh);
        const mm = parseInt(_mm);
        if(isNaN(hh) || isNaN(mm)) return false;
        const __hh = ('0' + hh.toString()).substr(-2);
        const __mm = (mm.toString() + '0').substr(0, 2);
        return `${__hh}:${__mm}`;
    }

    created(){
        this.loadValues();
        const timeOptions = [];
        for(let i = 0; i < 24; i++){
            const tt = ('0' + i.toString()).substr(-2) + ':00';
            timeOptions.push({
                key: tt,
                value: tt,
                text: tt
            })
        }
        this.timeOptions = timeOptions;
    }

    mounted(){
        this.bookingSlots = Object.clone(this.$store.state.bookingSlots);
    }
}
</script>

<style lang="scss" scoped>
@import '@/scss/vars.scss';
.segment{
    text-align: left;
}
h2{
    text-align: left;
}
.input{
    margin-top: .5rem !important;
}
.save-btn{
    margin-top: .5rem;
    width: 10rem;
    margin-left: 0.3rem;
}
.success-text{
    color: $green;
    font-style: italic;
    font-size: 1.3rem;
    margin-left: 0.5rem;
}
.checks-parent .checkbox{
    margin-right: 1rem;
}
.right.segment{
    max-width: 60vw;
}
.booking-slots{
    overflow-y: scroll;
    max-height: calc(100vh - 250px);
}
.booking-slot-day{
    padding-bottom: 2rem;
    &:not(:last-child){
        border-bottom: 1px solid rgb(223, 223, 223);
        margin-bottom: 1rem;
    }
}
.save-bs-btn{
    float: right;
}
</style>
