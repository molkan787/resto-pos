<template>
    <Modal v-model="open" title="Assing booking's table" size="small" >
        <div class="assign-tables-form">
            <div class="left">
                <div class="info">
                    <label>Booking #</label>
                    {{ booking.no }}
                </div>
                <div class="info">
                    <label>Date</label>
                    {{ booking.date }}
                </div>
                <div class="info">
                    <label>Time</label>
                    {{ booking.time }}
                </div>
                <div class="info">
                    <label>Number of persons</label>
                    {{ booking.number_of_persons }}
                </div>
            </div>
            <div class="right">
                <div class="tables">
                    <button
                        v-for="table in tables" :key="table.n"
                        class="ui button table-btn" :class="{ booked: table.booked, selected: !!selectedTables[table.n] }"
                        :title="table.booked ? 'This table is already booked for the same date & time (for another booking)' : ''"
                        @click="toggleTable(table.n)"
                    >
                        {{ table.n }}
                    </button>
                </div>
            </div>
        </div>
        <hr>
        <div class="summary">
            <div class="info">
                <label>Number of tables needed</label>
                {{ neededTablesCount }} Table(s)
            </div>
            <div class="info">
                <label>Number of Selected Tables</label>
                {{ selectedTablesCount }} Table(s)
            </div>
            <div class="info">
                <label>Capacity of Selected Tables</label>
                {{ selectedTablesCapacity }} Persons
            </div>
        </div>
        <template v-slot:buttons>
            <button class="ui button" @click="open = false">CANCEL</button>
            <button class="ui positive button" @click="saveClick" :loading="loading">SAVE</button>
        </template>
    </Modal>
</template>

<script>
import MxHelper from '@/prs/MxHelper';
import Modal from '../Elts/Modal.vue';
import Message from '@/ccs/Message';
import { mapState } from 'vuex';
import { services } from '../../services';
import DM from '../../prs/dm';

export default {
    components: {
        Modal,
    },
    data: () => ({
        open: false,
        loading: false,
        booking: {},
        bookedTables: {1: true, 3: true},
        selectedTables: {}
    }),
    computed: {
        ...mapState(['tables_count', 'persons_per_table']),
        tables(){
            return ' '.repeat(this.tables_count).split('').map((_, i) => ({
                n: i + 1,
                booked: !!this.bookedTables[i + 1]
            }))
        },
        selectedTablesCount(){
            return Object.values(this.selectedTables).filter(v => !!v).length;
        },
        selectedTablesCapacity(){
            return this.selectedTablesCount * this.persons_per_table;
        },
        neededTablesCount(){
            return Math.ceil(this.booking.number_of_persons / this.persons_per_table);
        }
    },
    methods: {
        openModal(booking){
            this.booking = booking;
            this.bookedTables = {};
            this.selectedTables = (this.booking.assigned_tables || []).reduce((m, t) => (m[t.table_no] = true) && m, {});
            this.loadAdditionalData();
            this.open = true;
        },
        async loadAdditionalData(){
            const { date, time } = this.booking;
            const { bookedTables } = await services.instances.tableState.getBookedTables(date, time);
            this.bookedTables = bookedTables.filter(n => !this.selectedTables[n]).reduce((m, n) => (m[n] = true) && m, {});
        },
        toggleTable(n){
            if(this.bookedTables[n]){
                Message.info(`Table #${n} is already booked for the same date & time (for another booking)`, 'Booking').then(e => e.hide());
                return;
            }
            this.$set(this.selectedTables, n, !this.selectedTables[n]);
        },
        validateForm(){
            if(this.selectedTablesCount < 1){
                Message.info('Please select a table', 'Booking').then(e => e.hide());
                return false;
            }
            return true;
        },
        saveClick(){
            if(this.validateForm()){
                this.save();
            }
        },
        async save(){
            this.loading = true;
            const booking_no = this.booking.no;
            const assigned_tables = Object.entries(this.selectedTables)
                                            .filter(([_, s]) => s)
                                            .map(([n]) => ({ booking_no, table_no: parseInt(n) }));
            try {
                console.log(assigned_tables);
                await DM.updateBooking(this.booking.id, { assigned_tables, no: booking_no });
                this.booking.assigned_tables = assigned_tables;
                Message.info('Changes were successfully saved!', 'Success!').then(e => {
                    e.hide();
                    this.open = false;
                });
            } catch (error) {
                console.error(error);
                Message.info('An error occured, Please try again.', 'Error').then(e => e.hide());
            }
            this.loading = false;
        }
    },
    created(){
        MxHelper.registerFunction('openAssignTablesModal', (booking) => this.openModal(booking));
        // setTimeout(() => {
        //     this.openModal({ number_of_persons: 2 })
        // }, 500);
    }
}
</script>

<style lang="scss" scoped>
.assign-tables-form{
    display: flex;
    flex-direction: row;
    & > .left{
        width: 300px;
    }
    & > .right{
        flex: 1;
    }
    .tables{
        display: grid;
        grid-template-columns: repeat(6, calc((100% - 2.5rem) / 6));
        grid-row-gap: 0.5rem;
        .table-btn{
            font-size: 1.5rem;
            text-align: center;
            padding-left: 0 !important;
            padding-right: 0 !important;
            &.booked{
                background-color: rgb(245, 219, 72);
            }
            &.selected{
                background-color: #2185D0;
                color: white;
            }
        }
    }
}
.info{
    font-size: 1.3rem;
    &:not(:last-child){
        margin-bottom: 0.5rem;
    }
    label{
        display: block;
        opacity: 0.7;
        font-size: 1rem;
    }
}
.summary{
    display: grid;
    grid-template-columns: repeat(3, calc(100% / 3));
    .info{
        margin: auto;
    }
}
</style>