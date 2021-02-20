<template>
    <div class="booking-list">
        <div class="filters">
            <div class="ui form">
                <div class="field">
                    <label>Date</label>
                    <sui-input v-model="bookings.filterDate" type="date" :loading="bookings.loading" :disabled="bookings.loading" />
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
                        <sui-table-header-cell>Date</sui-table-header-cell>
                        <sui-table-header-cell>Time</sui-table-header-cell>
                        <sui-table-header-cell style="white-space: nowrap;">Number of persons</sui-table-header-cell>
                        <sui-table-header-cell>Status</sui-table-header-cell>
                        <sui-table-header-cell>Customer</sui-table-header-cell>
                    </sui-table-row>
                </sui-table-header>

                <sui-table-body>

                    <sui-table-row v-for="(item, index) in shownItems" :key="item.id + index">

                        <sui-table-cell>{{ item.date | localDate }}</sui-table-cell>
                        <sui-table-cell>{{ item.time | timeText }}</sui-table-cell>
                        <sui-table-cell collapsing>{{ item.number_of_persons }}</sui-table-cell>
                        <sui-table-cell>{{ item.status | capitalize }}</sui-table-cell>
                        <sui-table-cell>{{ item.owner.fullname | customerName }}</sui-table-cell>

                    </sui-table-row>
                    
                </sui-table-body>

            </sui-table>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Vue from 'vue';
import Utils from '@/utils';
export default {
    computed: {
        ...mapState(['bookings']),
        items(){
            const today = Utils.todaysDate('-');
            const fd = this.bookings.filterDate;
            return fd && fd != today ? this.bookings.other : this.bookings.todays;
        },
        shownItems(){
            const s = this.customerName;
            if(s){
                const names = s.toLowerCase().split(' ').map(n => n.trim());
                const s1 = names.join(' ');
                const s2 = names.reverse().join(' ');
                return this.items.filter(i => {
                    const n = i.owner.fullname.toLowerCase();
                    return n.includes(s1) || n.includes(s2)
                });
            }else{
                return this.items;
            }
        },
    },
    data: () => ({
        customerName: '',
    }),
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