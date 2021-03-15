<template>
    <Modal v-model="open" title="Add Table Booking" size="small" >
        <AddBookingForm ref="addBookingForm" :booking="booking" />
        <template v-slot:buttons>
            <button class="ui button" @click="open = false">CANCEL</button>
            <button class="ui positive button" @click="saveClick" :loading="loading">CREATE BOOKING</button>
        </template>
    </Modal>
</template>

<script>
import MxHelper from '@/prs/MxHelper';
import Modal from '../Elts/Modal.vue';
import AddBookingForm from './AddBookingForm';
import Message from '@/ccs/Message';
import DM from '@/prs/dm';
import Utils from '@/utils';
export default {
    components: {
        Modal,
        AddBookingForm
    },
    data: () => ({
        open: false,
        loading: false,
        booking: {
            date: '',
            time: '',
            number_of_persons: 2,
            category: 'dinner',
            customer_name: '',
            customer_phone: ''
        }
    }),
    methods: {
        openModal(){
            this.clearForm();
            this.open = true;
        },
        clearForm(){
            this.booking = {
                date: '',
                time: '',
                number_of_persons: 2,
                category: 'dinner',
                customer_name: '',
                customer_phone: ''
            };
        },
        validateForm(){
            const { date, time, number_of_persons, customer_name, customer_phone } = this.booking;
            if(!(date && time && number_of_persons && customer_name && customer_phone)){
                Message.info('Please provide all details', 'Booking').then(e => e.hide());
                return false;
            }
            return true;
        },
        saveClick(){
            if(this.validateForm()){
                this.createBooking();
            }
        },
        getFullBookingData(){
            const { date, ...data } = this.booking;
            return {
                ...data,
                date: Utils.getDateValueFromDate(date),
                status: 'booked',
                comment: '',
                client_id: 0
            }
        },
        async createBooking(){
            this.loading = true;
            try {
                await DM.createBooking(this.getFullBookingData());
                Message.info('Booking successfully created:', 'Success').then(e => {
                    e.hide();
                    this.open = false;
                });
            } catch (error) {
                console.error(error);
                Message.info('An error occured, Please try again', 'Error').then(e => e.hide());
            }
            this.loading = false;
        }
    },
    created(){
        MxHelper.registerFunction('openAddBookingModal', () => this.openModal());
        // setTimeout(() => {
        //     this.openModal()
        // }, 500);
    }
}
</script>
