<template>
    <div class="offer-selection">
        <div v-if="eligibleOffers.length" class="two-cells-flex">
            <div>
                <label class="select-offer-label low-importance">Select an offer</label>
                <sui-dropdown
                    :placeholder="`${eligibleOffers.length} offers available`"
                    :options="eligibleOffersOptions"
                    v-model="pos.selectedOffer"
                />
            </div>
            <div v-if="benefitType == 'free_items'" class="select-items">
                <label class="select-offer-label low-importance">Select free items</label>
                <sui-dropdown
                    multiple
                    :placeholder="`${freeItemsOptions.length} items available`"
                    :options="freeItemsOptions"
                    v-model="pos.offerOptions.selectedItems"
                />
            </div>
        </div>
        <span v-else class="low-importance">
            No offer available for this order
        </span>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
    computed: {
        ...mapGetters(['eligibleOffers']),
        ...mapState(['pos', 'productsArray', 'productsByIds']),
        benefit(){
            const offerId = this.pos.selectedOffer;
            const offer = offerId && this.eligibleOffers.find(o => o.id == offerId);
            return offer ? offer.benefits[0] : null;
        },
        benefitType(){
            return this.benefit && this.benefit.type;
        },
        eligibleOffersOptions(){
            return this.eligibleOffers.map(({ id, name }) => ({
                key: id,
                value: id,
                text: name
            }))
        },
        freeItemsOptions(){
            const { items, all_items } = this.benefit;
            const _items = all_items ? this.productsArray : items.map(id => this.productsByIds[id]);
            return _items.map(({ id, name }) => ({ key: id, value: id, text: name }));
        }
    },
    data: () => ({

    })
}
</script>

<style lang="scss" scoped>
.offer-selection{
    text-align: left;
    font-size: 16px;
    line-height: 26px;
    .low-importance{
        opacity: 0.7;
    }
    .select-offer-label{
        padding-right: 1rem;
    }
    .two-cells-flex{
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        div:last-child{
            flex: 1;
        }
    }
    .select-items{
        margin-top: -8px;
        margin-left: 36px;
    }
}
</style>