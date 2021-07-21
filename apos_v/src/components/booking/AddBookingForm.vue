<template>
    <div class="add-booking-form">
        <div>
            <Datepicker
                v-model="booking.date"
                :disabled-dates="disabledDates"
                placeholder="Select a date"
                input-class="vs-input my-datepicker-input"
                calendar-class="my-datepicker-calendar"
                wrapper-class="my-datepicker-wrapper"
                maximum-view="day"
                :inline="true"
                :disabled="loading"
                @changedMonth="onMonthChanged"
            />
            <sui-form>
                <sui-form-field class="note-field">
                    <label>Note</label>
                    <textarea v-model="booking.comment" rows="2" cols="6" placeholder="Note / Comment"></textarea>
                </sui-form-field>
            </sui-form>
        </div>
        <div>
            <div class="ui form">
                <div class="field">
                    <label>Time</label>
                    <sui-dropdown
                        fluid
                        :disabled="!booking.date"
                        :options="timeOptions"
                        placeholder="Select Time"
                        selection
                        search
                        v-model="booking.time"
                    />
                </div>
                <div class="field">
                    <label>Number of persons</label>
                    <sui-dropdown
                        fluid
                        :disabled="!booking.time"
                        :options="personsOptions"
                        placeholder="Select Number of persons"
                        selection
                        search
                        v-model="booking.number_of_persons"
                    />
                </div>
                <div class="field">
                    <label>Category</label>
                    <sui-dropdown
                        fluid
                        :options="categoryOptions"
                        placeholder="Select Category"
                        selection
                        search
                        v-model="booking.category"
                    />
                </div>
                <div class="field">
                    <label>Customer name</label>
                    <sui-input v-model="booking.customer_name" />
                </div>
                <div class="field">
                    <label>Customer phone</label>
                    <sui-input v-model="booking.customer_phone" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import DM from '@/prs/dm';
import { Interfaces, TextUtils } from 'murew-core';
import Utils from '@/utils';
export default {
    props: {
        booking: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState(['bookingSlots', 'tables_count', 'persons_per_table']),
        timeOptions(){
            const slots = this.availableTimeSlots[this.selectedDate] || [];
            return slots.map(t => ({ key: t, value: t, text: t }));
        },
        selectedDate(){
            const d = this.booking.date;
            if(d){
                return Utils.getDateValueFromDate(d);
            }else{
                return '';
            }
        },
        personsOptions(){
            const time = this.booking.time;
            if(!time){
                return [{ key: '2', value: 2, text: '2 Persons' }];
            }
            const options = [];
            const bookedTables = (this.bookedSlots[this.selectedDate] || {})[time] || 0;
            const freeTables = this.tables_count - bookedTables;
            const maxPersons = freeTables * this.persons_per_table;
            for(let i = 1; i <= maxPersons; i++){
                options.push({
                    key: i.toString(),
                    value: i,
                    text: i == 1 ? '1 Person' : `${i} Persons`
                });
            }
            return options;
        }
    },
    watch: {
        'booking.date'(){
            this.booking.time = '';
        },
        'booking.time'(){
            this.booking.number_of_persons = 2;
        }
    },
    data: () => ({
        loading: false,
        disabledDates: {},
        bookedSlots: {},
        availableTimeSlots: {},
        categoryOptions: [
            { key: 'breakfast', value: 'breakfast', text: 'Breakfast' },
            { key: 'lunch', value: 'lunch', text: 'Lunch' },
            { key: 'dinner', value: 'dinner', text: 'Dinner' },
        ]
    }),
    methods: {
        onMonthChanged(date){
            this.loadBookedSlots(date);
        },
        async loadBookedSlots(monthDate){
            const yyyy = monthDate.getFullYear().toString();
            const mm = ('0' + (monthDate.getMonth() + 1).toString()).substr(-2);
            const month = `${yyyy}-${mm}`;
            this.disabledDates.days = Array.from(Interfaces.Days.keys());
            this.bookedSlots = await DM.getBookedSlots(month);
            this.updateAvailableTimeSlots(month);
            this.updateDisabledDays();
        },
        updateAvailableTimeSlots(month){
            const tables = this.tables_count;
            const ats = {};
            const slots = this.bookingSlots;
            const booked = this.bookedSlots;
            console.log(booked)
            for(let i = 1; i <= 31; i++){
                const date = `${month}-${('0' + i.toString()).substr(-2)}`;
                const day = TextUtils.getDayNameFromDate(new Date(date));
                const times = slots[day];
                const bkd = booked[date];
                if(times){
                    ats[date] = bkd ? times.filter(t => !bkd[t] || bkd[t] < tables) : times;
                }else{
                    ats[date] = [];
                }
            }
            this.availableTimeSlots = ats;
        },
        updateDisabledDays(){
            const days = [].concat(Interfaces.Days);
            const disabledDays = [];
            days.forEach((day, index) => {
                const ds = this.bookingSlots[day];
                if(!ds || ds.length < 1) disabledDays.push(index);
            })

            const ats = this.availableTimeSlots;
            const disabledDates = [];
            const bookedDates = Object.entries(ats);
            const len = bookedDates.length;
            for(let i = 0; i < len; i++){
                const [ date, timeslots ] = bookedDates[i];
                if(timeslots.length < 1){
                    disabledDates.push(new Date(date));
                }
            }

            this.disabledDates.days = disabledDays;
            this.disabledDates.dates = disabledDates;
        },
    },

    mounted(){
        const laterDate = new Date();
        laterDate.setMonth(laterDate.getMonth() + 3);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.disabledDates = {
            to: yesterday,
            from: laterDate,
            days: this.disabledDates.days || Array.from(Interfaces.Days.keys()),
            dates: this.disabledDates.dates || []
        }
        this.$nextTick(() => this.loadBookedSlots(new Date()));
    }
}
</script>

<style lang="scss" scoped>
.add-booking-form{
    min-height: 350px;
    display: flex;
    flex-direction: row;
    & > div{
        flex: 1;
        // &:last-child{
        //     padding-left: 1rem;
        // }
    }
    .note-field{
        margin-right: 39px;
        margin-top: 8px;
    }
}
</style>