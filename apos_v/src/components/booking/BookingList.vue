<template>
    <div class="booking-list">
        <div class="filters">
            <div class="ui form">
                <div class="field">
                    <label>Date</label>
                    <sui-input v-model="filterDate" type="date" :loading="loading" :disabled="loading" />
                </div>
            </div>
            <div class="ui form">
                <div class="field">
                    <label>Search by customer name</label>
                    <div class="ui action input">
                        <input v-model="customerName" type="text" placeholder="Customer name">
                        <button @click="customerName = ''" class="ui button">Clear</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-wrapper">
            <sui-table celled striped size="large">
                <sui-table-header>
                    <sui-table-row>
                        <sui-table-header-cell>NO</sui-table-header-cell>
                        <sui-table-header-cell>Date</sui-table-header-cell>
                        <sui-table-header-cell>Time</sui-table-header-cell>
                        <sui-table-header-cell style="white-space: nowrap;">Number of persons</sui-table-header-cell>
                        <sui-table-header-cell>Status</sui-table-header-cell>
                        <sui-table-header-cell>Category</sui-table-header-cell>
                        <sui-table-header-cell>Customer</sui-table-header-cell>
                        <sui-table-header-cell>Phone</sui-table-header-cell>
                        <sui-table-header-cell> </sui-table-header-cell>
                    </sui-table-row>
                </sui-table-header>

                <sui-table-body>

                    <sui-table-row v-for="(item) in shownItems" :key="item.no">

                        <sui-table-cell>{{ item.no }}</sui-table-cell>
                        <sui-table-cell>{{ item.date | localDate }}</sui-table-cell>
                        <sui-table-cell>{{ item.time | timeText }}</sui-table-cell>
                        <sui-table-cell collapsing>{{ item.number_of_persons }}</sui-table-cell>
                        <sui-table-cell>{{ item.status | capitalize }}</sui-table-cell>
                        <sui-table-cell>{{ item.category | capitalize }}</sui-table-cell>
                        <sui-table-cell>{{ item.customer_name | capitalizeAll }}</sui-table-cell>
                        <sui-table-cell>{{ item.customer_phone }}</sui-table-cell>
                        <sui-table-cell class="controls-cell">

                            <template v-if="item.status == 'booked'">
                                <sui-button @click="cancelClick(item)" size="tiny">
                                    <sui-icon name="ban" />
                                    Cancel
                                </sui-button>
                                <sui-button @click="arrivedClick(item)" size="tiny" positive>
                                    <sui-icon name="sign-in" />
                                    Arrived
                                </sui-button>
                            </template>
                            <template v-else-if="item.status == 'arrived'">
                                <sui-icon name="check" /> Arrived!
                            </template>
                            <template v-else>
                                {{ item.status | capitalize }}
                            </template>

                            <sui-button @click="assignTablesClick(item)" size="tiny">
                                <sui-icon name="edit" />
                                {{ item.assigned_tables && item.assigned_tables.length > 0 ? 'Change' : 'Assign' }} Table(s)
                            </sui-button>

                            <div v-if="item.assigned_tables && item.assigned_tables.length > 0">
                                Assigned Table(s):
                                <strong>
                                    {{ item.assigned_tables.map(at => at.table_no).join(', ') }}
                                </strong>
                            </div>

                        </sui-table-cell>

                    </sui-table-row>

                    <sui-table-row v-if="shownItems.length == 0">
                        <sui-table-cell colspan="6" style="text-align: center">
                            <template v-if="bookings.loading">
                                Loading...
                            </template>
                            <template v-else>
                                There is no bookings for {{ selectedDateText }}
                            </template>
                        </sui-table-cell>
                    </sui-table-row>
                    
                </sui-table-body>

            </sui-table>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import Utils from '@/utils';
import Dl from '@/prs/dl';
import Message from '@/ccs/Message';
import DM from '@/prs/dm';
import MxHelper from '@/prs/MxHelper';
export default {
    computed: {
        shownItems(){
            const s = this.customerName;
            if(s){
                const names = s.toLowerCase().split(' ').map(n => n.trim());
                const s1 = names.join(' ');
                const s2 = names.reverse().join(' ');
                return this.bookings.filter(i => {
                    const n = (i.customer_name || '').trim().toLowerCase();
                    return n.includes(s1) || n.includes(s2)
                });
            }else{
                return this.bookings;
            }
        },
        selectedDateText(){
            return this.filterDate || Utils.todaysDate('-');
        }
    },
    watch: {
        selectedDateText(){
            this.loadBookings();
        }
    },
    data: () => ({
        customerName: '',
        filterDate: '',
        loading: false,
        bookings: [],
    }),
    methods: {
        assignTablesClick(booking){
            MxHelper.openAssignTablesModal(booking);
        },
        async arrivedClick(booking){
            const mr = await Message.ask(`Did customer for booking # ${booking.no} arrived?`, 'Booking');
            if(mr.answer){
                mr.loading();
                try {
                    await DM.updateBooking(booking.id, { status: 'arrived' });
                    booking.status = 'arrived';
                    mr.hide();
                } catch (error) {
                    console.error(error);
                    mr.hide();
                    Message.info('An error occured, Please try again', 'Error').then(r => r.hide());
                }
            }else{
                mr.hide();
            }
        },
        async cancelClick(booking){
            const mr = await Message.ask(`Cancel booking # ${booking.no} ?`, 'Cancel Booking');
            if(mr.answer){
                mr.loading();
                try {
                    await DM.updateBooking(booking.id, { status: 'canceled' });
                    booking.status = 'canceled';
                    mr.hide();
                } catch (error) {
                    console.error(error);
                    mr.hide();
                    Message.info('An error occured, Please try again', 'Error').then(r => r.hide());
                }
            }else{
                mr.hide();
            }
        },
        async loadBookings(){
            this.loading = true;
            try {
                this.bookings = await Dl.getBookings({
                    date: this.selectedDateText
                });
                console.dir(this.bookings)
            } catch (error) {
                console.error(error);
            }
            this.loading = false;
        },
    },
    filters: {
        timeText(time){
            return time.split(':').slice(0, 2).join(':');
        },
        localDate(date){
            return new Date(date).toLocaleDateString();
        },
        customerName(fullname){
            const n = fullname || '';
            return n.split(' ').map(p => Vue.filter('capitalize')(p.trim())).join(' ');
        }
    }
}
</script>

<style lang="scss" scoped>
.table-wrapper{
    height: 500px;
    overflow-y: scroll;
}
.filters{
    padding-bottom: 2rem;

    div{
        width: 450px;
        &:first-child{
            display: inline-block;
        }
        &:last-child{
            float: right;    
        }
    }
}
</style>

<style lang="scss">
.booking-list{
    .controls-cell button{
        margin-bottom: 0.3rem;
    }
}
</style>