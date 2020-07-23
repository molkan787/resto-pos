<template>
    <div class="order-type-details">
        <h2>{{ type }} Order</h2>
        <template v-if="type == 'table'">
            <div class="tables">
                <sui-button v-for="t in tables" :key="t" @click="setTable(t)" :class="getTableBtnClass(t)">
                    {{ t }}
                </sui-button>
            </div>
        </template>
        <sui-form v-else class="my-form">
            <ClientInfoForm @request-refresh="loadData" :autoLoadClient="true" :data="details" :showAddress="type == 'delivery'" />
        </sui-form>

        <div class="footer">
            <sui-button @click="app.showOrderTypeDetails = false">Cancel</sui-button>
            <sui-button v-if="type != 'table'" @click="saveClick" color="green">Ok</sui-button>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import ClientInfoForm from '../pre/ClientInfoForm.vue';
export default {
    components: {
        ClientInfoForm
    },
    computed: {
        ...mapState({
            app: state => state.app,
            pos: state => state.pos,
            type: state => state.pos.orderType,
            tables_count: state => state.tables_count,
            tablesState: state => state.tablesState,
        }),
        table(){
            return this.pos.orderDetails.table;
        },
        tables(){
            const result = [];
            for(let i = 1; i <= this.tables_count; i++){
                result.push(i);
            }
            return result;
        }
    },
    data: () => ({
        details: {}
    }),
    methods: {

        getTableBtnClass(number){
            if(this.table == number){
                return 'selected';
            }else{
                return this.tablesState[number] ? 'occupied' : 'free';
            }
        },

        setTable(table){
            if(this.tablesState[table]){
                info(`Table #${table} is already occupied, Please choose another table.`).then(e => e.hide())
                return;
            }
            this.details.table = table;
            this.save();
            setTimeout(() => {
                this.app.showOrderTypeDetails = false;
            }, 500)
        },

        saveClick(){
            const error = this.validateForm();
            if(error){
                info(error, 'POS').then(e => e.hide())
            }else{
                this.save();
                this.app.showOrderTypeDetails = false;
            }
        },

        save(){
            this.pos.orderDetails = this.details;
        },

        validateForm(){
            this.trimForm();
            const t = this.type;
            const d = this.details;
            if(t == 'table'){
                if(d.table.length < 1) return 'Please enter Table number.';
            }else if(t == 'delivery'){
                if(d.first_name.length < 2) return 'Please enter customer first name';
                if(d.phone.length != 11) return 'Please enter a valid phone number';
                if(d.address_1.length < 3) return 'Please enter a valid address';
                if(d.postcode.length < 3) return 'Please enter a valid postcode';
            }else if(t == 'collection'){
                if(d.first_name.length < 2) return 'Please enter customer first name';
            }
            return null;
        },

        loadData(){
            this.details = JSON.parse(JSON.stringify(this.pos.orderDetails));
        },

        trimForm(){
            const d = this.details;
            for(let p in d){
                if(typeof d[p] == 'string') d[p] = d[p].trim();
            }
        }
    },
    mounted(){
        this.loadData();
    }
}
</script>

<style lang="scss" scoped>
.order-type-details{
    padding: 10px;
    width: 100%;
    position: absolute;
    z-index: 1;
    height: 100%;
    background-color: #f7f7f7;
    // box-shadow: 0 0 5px #00000038;
    h2{
        text-transform: capitalize;
    }
    .footer{
        position: absolute;
        bottom: 7px;
        left: 7px;
        width: 100%;
        text-align: right;
        padding-right: 2rem;
        button{
            font-size: 1.2rem !important;
        }
    }
    .tables-header{
        margin-top: 0;
        text-align: center;
    }
    .tables{
        width: 100%;
        display: grid;
        grid-template-columns: repeat(10, 10%);
        button{
            font-size: 2rem;
            padding-left: 0;
            padding-right: 0;
            margin-bottom: 0.25em;
                color: white;
            &.selected{
                background-color: #2185D0;
            }
            &.occupied{
                opacity: 0.3;
                background-color: red;
            }
            &.free{
                background-color: rgb(51, 192, 98);
            }
        }
    }
}
</style>