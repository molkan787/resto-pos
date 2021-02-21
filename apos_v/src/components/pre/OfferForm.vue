<template>
    <div class="ui form">

        <div class="field">
            <div class="two fields">
                <div class="field">
                    <label>Name</label>
                    <input v-model="data.name" type="text" placeholder="Offer name">
                </div>
                <div class="field">
                    <label>Expire date</label>
                    <input v-model="data.expires" type="date">
                </div>
            </div>
        </div>

        <h4 class="ui dividing header">Condition</h4>
        <div class="field">
            <div class="two fields">
                <div class="field">
                    <label>Minimum order value</label>
                    <input v-model="data.condition.minimum_order_value" type="number" placeholder="0" min="0">
                </div>
                <div class="field">
                    <label>Minimum items count</label>
                    <input v-model="data.condition.minimum_items_count" type="number" placeholder="0" min="0">
                </div>
            </div>
        </div>

        <h4 class="ui dividing header">Available on</h4>
        <div class="field">
            <div class="two fields">
                <div class="field">
                    <sui-checkbox v-model="data.available_on_delivery">Delivery</sui-checkbox> <br>
                    <sui-checkbox v-model="data.available_on_pickup">Pickup</sui-checkbox>
                </div>
                <div class="field">
                    <sui-checkbox v-model="data.available_on_website">Website</sui-checkbox> <br>
                    <sui-checkbox v-model="data.available_on_pos">POS</sui-checkbox>
                </div>
            </div>
        </div>

        <h4 class="ui dividing header">Promo code</h4>
        <div class="field">
            <div class="two fields">
                <div class="field">
                    <sui-checkbox v-model="data.activated_by_promo_code">Use promo code to activate this offer</sui-checkbox>
                </div>
                <div v-if="data.activated_by_promo_code" class="field">
                    <label>Promo code</label>
                    <input v-model="data.promo_code" type="text" placeholder="------">
                </div>
            </div>
        </div>
        
        <h4 class="ui dividing header">Benefits</h4>
        <div class="field">
            <div class="two fields">
                <div class="field">
                    <sui-checkbox v-model="benefit.type" radio value="percent_discount">Percent discount</sui-checkbox>
                </div>
                <div class="field">
                    <sui-checkbox v-model="benefit.type" radio value="free_items">Free items</sui-checkbox>
                </div>
            </div>
        </div>

        <template v-if="benefit.type == 'percent_discount'">
            <div class="field">
                <label>Percent amount</label>
                <input v-model.number="benefit.percent_amount" type="number" min="0" max="100" placeholder="ex: 10" />
            </div>
        </template>
        <template v-else>
            <div class="field">
                <label>
                    Items
                </label>
                <sui-dropdown
                    fluid
                    multiple
                    :options="products"
                    placeholder="Items"
                    selection
                    v-model="benefit.items"
                    :disabled="benefit.all_items"
                />
                <sui-checkbox v-model="benefit.all_items">Include all items?</sui-checkbox>
            </div>
            <div class="field">
                <div class="two fields">
                    <div class="field">
                        <label>Maximum number of items</label>
                        <input v-model.number="benefit.max_items" type="number" min="0" >
                    </div>
                    <div class="field">
                        <label>Maximum value of selected items</label>
                        <input v-model.number="benefit.max_value" type="number" min="0" >
                        <label style="opacity: 0.5"> &nbsp;&nbsp; 0 = unlimited</label>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState(['productsArray']),
        products(){
            return this.productsArray.map(p => ({
                key: p.id,
                value: p.id,
                text: p.name
            }))
        },
        benefit(){
            return this.data.benefits[0];
        },
        benefitJson(){
            return JSON.stringify(this.benefit)
        }
    },
    watch: {
        'benefit.type'(currentType, previousType){
            this.switchBenefitData(currentType, previousType);
        }
    },
    data: () => ({
        benefitDataCache: {}
    }),
    methods: {
        getBenefitData(data, type){
            const b = data;
            if(type == 'percent_discount'){
                return {
                    __component: "offer.benefit-percent-discount",
                    type: "percent_discount",
                    percent_amount: b.percent_amount || 0
                }
            }else{
                return {
                    __component: "offer.benefit-free-items",
                    type: "free_items",
                    all_items: b.all_items || false,
                    items: b.items || [],
                    max_items: typeof b.max_items == 'number' ? b.max_items : 1,
                    max_value: typeof b.max_value == 'number' ? b.max_value : 0,
                }
            }
        },
        switchBenefitData(currentType, previousType){
            const prevData = this.getBenefitData(this.benefit, previousType);
            const currData = this.getBenefitData(this.benefitDataCache, currentType);
            Vue.set(this.data.benefits, 0, currData);
            this.benefitDataCache = prevData;
        }
    }
}
</script>