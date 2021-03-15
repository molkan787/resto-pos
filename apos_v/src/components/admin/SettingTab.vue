<template>
    <div class="ui horizontal segments">
        <div class="ui vertical segments segment">
            <div class="ui segment">
                <h2>Receipt informations</h2>
                <hr>
                <LabeledInput class="input" label="VAT NUMBER" v-model="my_vat_number" :disabled="loading"/> <br>
            </div>
            <div class="ui segment">
                <h2>POS</h2> <hr>
                <LabeledInput class="input" label="NUMBER OF TABLES" v-model="my_tables_count" type='number' :disabled="loading"/> <br>
                <LabeledInput class="input" label="NUMBER OF PERSONS PER TABLE" v-model="my_persons_per_table" type='number' :disabled="loading"/> <br>
                <br>
                <div class="ui labeled input">
                    <label class="ui large label">USED ORDER TYPES</label>
                    <div class="input checks-parent">
                        <sui-checkbox v-model="my_order_types.table" label="Table Order" />
                        <sui-checkbox v-model="my_order_types.delivery" label="Delivery Order" />
                        <sui-checkbox v-model="my_order_types.collection" label="Collection Order" />
                    </div>
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
    computed: mapState(['vat_number', 'tables_count', 'persons_per_table', 'order_types']),
    watch: {
        my_tables_count(){
            this.$nextTick().then(() => {
                if(this.my_tables_count < 1){
                    this.my_tables_count = 1;
                }else if(this.my_tables_count > 250){
                    this.my_tables_count = 250;
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
    private my_vat_number: string = '';
    private my_tables_count: number = 0;
    private my_persons_per_table: number = 0;
    private my_order_types: any = {};
    
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
        const { table, delivery, collection } = this.my_order_types;
        const isValid = table || delivery || collection;
        if(!isValid){
            info('Please select at least one order type.').then(e => e.hide());
        }
        return isValid;
    }

    save(){
        DM.editSettings({
            vat_number: this.my_vat_number,
            tables_count: this.my_tables_count,
            order_types: this.my_order_types,
            persons_per_table: this.my_persons_per_table
        }).then(() => {
            this.showSuccessText();
        }).catch(err => {
            Message.info('We could not complete the current action');
        }).finally(() => this.loading = false);
    }

    loadValues(){
        this.my_vat_number = this.vat_number;
        this.my_tables_count = this.tables_count;
        this.my_persons_per_table = this.persons_per_table;
        this.my_order_types = Object.clone(this.order_types);
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
    margin-left: 1rem;
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
