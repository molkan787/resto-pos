<template>
    <div class="order-details">
        <sui-form class="my-form row">
            <div class="two fields col span3">
                <div class="field">
                    <label>Order NO</label>
                    <input readonly type="text" :value="order.no">
                </div>
                <div class="field">
                    <label>Status</label>
                    <input readonly type="text" :value="status">
                </div>
            </div>
            <div class="col span2">
                <div class="field pad-1">
                    <label>Order Type</label>
                    <input readonly type="text" :value="type | capitalize">
                </div>
            </div>
        </sui-form>
        <div class="row">
            <div class="stack col span3">
                <sui-table celled striped>
                    <sui-table-header>
                        <sui-table-row>
                            <sui-table-headerCell>Name</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">Quantity</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">Unit Price</sui-table-headerCell>
                            <sui-table-headerCell collapsing>Note</sui-table-headerCell>
                        </sui-table-row>
                    </sui-table-header>
                    <sui-table-body>
                        <sui-table-row v-for="p in items" :key="p.id">
                            <sui-table-cell>
                                {{  p.name }}
                                <div v-if="p.extras && p.extras.length > 0">
                                    <div v-for="ex in p.extras" :key="ex.id">+ {{ ex.name }}</div>
                                </div>
                            </sui-table-cell>
                            <sui-table-cell collapsing text-align="right">
                                {{ p.id == 'discount' ? '-' : p.quantity }}
                            </sui-table-cell>
                            <sui-table-cell collapsing text-align="right">
                                {{ p.price | price }}
                            </sui-table-cell>
                            <sui-table-cell collapsing>{{ p.note || '---' }}</sui-table-cell>
                        </sui-table-row>
                    </sui-table-body>
                </sui-table>
                <div class="fill-space"></div>
                <sui-table celled striped>
                    <sui-table-header>
                        <sui-table-row>
                            <sui-table-headerCell text-align="right">Sub-total</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">{{ order.total | price_m }}</sui-table-headerCell>
                        </sui-table-row>
                        <!-- <sui-table-row v-if="order.type == OrderType.Delivery">
                            <sui-table-headerCell text-align="right">Delivery</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">{{ attrs.delivery_cost | price }}</sui-table-headerCell>
                        </sui-table-row> -->
                        <sui-table-row>
                            <sui-table-headerCell text-align="right">Total</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">{{ order.total | price_m }}</sui-table-headerCell>
                        </sui-table-row>
                    </sui-table-header>
                    <sui-table-body>
                    </sui-table-body>
                </sui-table>
            </div>
            <div v-if="order.order_type != OrderType.Table" class="col span2">
                <div class="ui form pad-1">
                    <h4>Customer</h4>
                    <div class="two fields">
                        <div class="field">
                            <label>First Name</label>
                            <sui-input :value="details.first_name | capitalize" placeholder="First Name" readonly/>
                        </div>
                        <div class="field">
                            <label>Last Name</label>
                            <sui-input :value="details.last_name | capitalize" placeholder="Last Name" readonly/>
                        </div>
                    </div>
                    <div class="two fields">
                        <div class="field">
                            <label>Phone Number</label>
                            <sui-input :value="details.phone" placeholder="Phone Number" readonly/>
                        </div>
                        <div class="field">
                            <label>Last Name</label>
                            <sui-input :value="details.email || '---'" placeholder="Email Address" readonly/>
                        </div>
                    </div>
                    <template v-if="order.order_type == OrderType.Delivery">
                        <h4>Delivery Address</h4>
                        <div class="inline fields">
                            <div class="eight wide field">
                                <sui-input v-model="details.address_1" placeholder="Line 1" readonly/>
                            </div>
                            <div class="eight wide field">
                                <sui-input v-model="details.postcode" placeholder="Postcode" readonly/>
                            </div>
                        </div>
                        <div class="inline fields">
                            <div class="eight wide field">
                                <sui-input v-model="details.address_2" placeholder="Line 2" readonly/>
                            </div>
                            <div class="eight wide field">
                                <sui-input v-model="details.city" placeholder="City" readonly/>
                            </div>
                        </div>
                    </template>
                    <template v-if="preorder">
                        <h4>Preorder</h4>
                        <div class="two fields">
                            <div class="field">
                                <label>Date</label>
                                <sui-input :value="preorderDate" placeholder="Date" readonly/>
                            </div>
                            <div class="field">
                                <label>Time</label>
                                <sui-input :value="preorderTime" placeholder="Time" readonly/>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { OrderType } from 'murew-core/dist/types';
export default {
    props: {
        order: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        OrderType: OrderType
    }),
    computed: {
        details(){
            return this.order.order_details;
        },
        type(){
            if(this.order.order_type == OrderType.Table){
                return `table #${this.details.table}`;
            }else{
                return this.order.order_type;
            }
        },
        status(){
            const { status, other_data: { onlineOrderId } } = this.order;
            if(status == 1 && typeof onlineOrderId == 'string'){
                return 'Accepted';
            }else if(status == 1){
                return 'Placed';
            }else if(status == 2){
                return 'Completed';
            }else if(status == 3){
                return 'Canceled';
            }
        },
        items(){
            const { products, counts } = this.order.items;
            return products.map(({ id, name, price, note, extras}) => ({
                id,
                name,
                price,
                note,
                extras,
                quantity: counts[id],
            }))
        },
        preorder(){
            return this.order.order_details.preorder;
        },
        preorderDate(){
            return new Date(this.preorder.date).toLocaleDateString();
        },
        preorderTime(){
            return this.preorder.time.split(':').slice(0, 2).join(':');
        }
    }
}
</script>

<style lang="scss" scoped>
.row{
    display: flex;
    flex-direction: row;
    .col{
        &.span3{
            flex: 3;
        }
        &.span2{
            flex: 2;
        }
        &.stack{
            display: flex;
            flex-direction: column;
            .fill-space{
                flex: 1;
            }
        }
    }
}
.pad-1{
    padding: 0 1rem;
}
.mar-1{
    margin: 0 1rem;
}
</style>