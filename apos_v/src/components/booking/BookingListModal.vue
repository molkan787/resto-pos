<template>
    <Modal v-model="open" title="Bookings" size="large" >
        <BookingList ref="bookingsList" />
        <template v-slot:buttons>
            <button class="ui button primary left" @click="createBookingClick()">CREATE BOOKING</button>
            <button class="ui button" @click="open = false">CLOSE</button>
        </template>
    </Modal>
</template>

<script>
import MxHelper from '@/prs/MxHelper';
import Modal from '../Elts/Modal.vue';
import BookingList from './BookingList';
export default {
    components: {
        Modal,
        BookingList
    },
    data: () => ({
        open: false,
    }),
    methods: {
        openModal(){
            this.open = true;
            this.$refs.bookingsList.loadBookings();
        },
        createBookingClick(){
            MxHelper.openAddBookingModal();
        }
    },
    created(){
        MxHelper.registerFunction('openBookingListModal', () => this.openModal());
        // setTimeout(() => {
        //     this.openModal()
        // }, 500);
    }
}
</script>

<style lang="scss" scoped>
.button.left{
    float: left;
}
</style>