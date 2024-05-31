<template>
    <sui-segments horizontal>

        <sui-segment style="flex: 1;">
            <div class="ui form">
                <h4 class="low-importance">Products</h4>
                <sui-table celled striped>
                    <sui-table-header>
                        <sui-table-row>
                            <sui-table-headerCell>Name</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">Quantity</sui-table-headerCell>
                            <sui-table-headerCell collapsing>Note</sui-table-headerCell>
                        </sui-table-row>
                    </sui-table-header>
                    <sui-table-body>
                        <sui-table-row v-for="p in order.products" :key="p.id">
                            <sui-table-cell>
                                {{ itemText(p) }}
                            </sui-table-cell>
                            <sui-table-cell collapsing text-align="right">
                                {{ p.pid == 'discount' ? '-' : p.quantity }}
                            </sui-table-cell>
                            <sui-table-cell collapsing>{{ p.note || '---' }}</sui-table-cell>
                        </sui-table-row>
                    </sui-table-body>
                </sui-table>
                <sui-table celled striped>
                    <sui-table-header>
                        <sui-table-row>
                            <sui-table-headerCell text-align="right">Products total</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">{{ order.total | price
                                }}</sui-table-headerCell>
                        </sui-table-row>
                        <sui-table-row v-if="order.type == OrderType.Delivery">
                            <sui-table-headerCell text-align="right">Delivery</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">{{ attrs.delivery_cost | price
                                }}</sui-table-headerCell>
                        </sui-table-row>
                        <sui-table-row>
                            <sui-table-headerCell text-align="right">Total</sui-table-headerCell>
                            <sui-table-headerCell collapsing text-align="right">{{ order.total | price
                                }}</sui-table-headerCell>
                        </sui-table-row>
                    </sui-table-header>
                    <sui-table-body>
                    </sui-table-body>
                </sui-table>
            </div>
        </sui-segment>

        <sui-segment style="flex: 1;">
            <div class="ui form">
                <h4 class="low-importance">Customer</h4>
                <div class="inline fields">
                    <div class="eight wide field">
                        <sui-input v-model="order.owner.fullname" placeholder="Fullname" icon="user" readonly />
                    </div>
                    <div class="eight wide field">
                        <sui-input v-model="order.owner.email" placeholder="Email" icon="at" readonly />
                    </div>
                </div>
                <h4><span class="low-importance">Order type:</span> {{ order.type | capitalize }}</h4>
                <template v-if="order.type == OrderType.Delivery">
                    <h4 class="low-importance">Delivery Address</h4>
                    <div class="inline fields">
                        <div class="eight wide field">
                            <sui-input v-model="delAddr.line1" placeholder="Line 1" readonly />
                        </div>
                        <div class="eight wide field">
                            <sui-input v-model="delAddr.postcode" placeholder="Postcode" readonly />
                        </div>
                    </div>
                    <div class="inline fields">
                        <div class="eight wide field">
                            <sui-input v-model="delAddr.line2" placeholder="Line 2" readonly />
                        </div>
                        <div class="eight wide field">
                            <sui-input v-model="delAddr.city" placeholder="City" readonly />
                        </div>
                    </div>
                </template>
                <template v-if="preorder">
                    <h4 class="low-importance">Preorder</h4>
                    <h5 style="margin: 0.5rem 0"><span class="low-importance">Date:</span> {{ preorderDate }}</h5>
                    <h5 style="margin: 0.5rem 0"><span class="low-importance">Time:</span> {{ preorderTime }}</h5>
                </template>
                <div>
                    <h4 class="low-importance">Note:</h4>
                    <textarea readonly cols="30" rows="2" placeholder="(empty)">{{ order.note }}</textarea>
                </div>
                <br>
                <div>
                    <slot name="bottom-right"></slot>
                </div>
            </div>
        </sui-segment>

    </sui-segments>
</template>


<script>
import { OrderType } from 'murew-core/dist/types';

export default {
    data: () => ({
        OrderType: OrderType,
    }),
    props: {
        order: {
            required: true,
            type: Object
        }
    },
    computed: {
        title(){
            return `New online order : ${this.order.no}`
        },
        attrs(){
            return this.order.attrs;
        },
        delAddr(){
            return this.order.delivery_address || {};
        },
        preorder(){
            return this.order.preorder;
        },
        preorderDate(){
            return new Date(this.preorder.date).toLocaleDateString();
        },
        preorderTime(){
            return this.preorder.time.split(':').slice(0, 2).join(':');
        },
    },
    methods: {
        itemText(p){
            return p.pid == 'discount' ? `${p.name} (${this.$options.filters.price(p.unit_price)})` : p.name;
        },
    }
}
</script>
