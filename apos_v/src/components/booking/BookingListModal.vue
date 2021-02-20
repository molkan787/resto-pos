<template>
    <Modal v-model="open" title="Bookings" size="large" >
        <BookingList />
        <template v-slot:buttons>
            <button class="ui button" @click="open = false">CLOSE</button>
        </template>
    </Modal>
</template>

<script>
import MxHelper from '@/prs/MxHelper';
import Modal from '../Elts/Modal.vue';
import BookingList from './BookingList';
import { services } from '@/services';
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
            services.instances.bookingsService.requestBookings();
            this.open = true;
        }
    },
    created(){
        MxHelper.registerFunction('openBookingListModal', () => this.openModal());
    }
}
</script>
