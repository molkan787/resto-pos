<template>
    <DataTable :cols="cols" :items="offers" :loading="loading"
    :filtersSchema="filtersSchema" :filtersValues="filtersValues"
    @edit="editClick" @delete="deleteClick" :controlls="controlls" />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import DataTable from '../Elts/DataTable.vue';
import { mapState } from 'vuex';
import DM from '@/prs/dm';
import MxHelper from '@/prs/MxHelper';
import Message from '@/ccs/Message';

@Component({
    components: {
        DataTable
    },
    computed: mapState({
        offers: (state: any) => state.offers,
        filtersValues: (state: any) => state.filtersState.offers,
    }),
})
export default class ClientsTab extends Vue{
    private loading: boolean = false;

    private cols = [
        {name: 'Id', prop: 'id'},
        {name: 'Name', prop: 'name'},
        {name: 'Expires on', prop: 'expires', filter: 'date'},
        {name: 'Promo code', prop: 'promo_code'},
        {name: '', prop: '@', buttons: [
            {name: 'edit', text: '', icon: 'edit', tooltip: 'Edit'},
            {name: 'delete', text: '', icon: 'delete', tooltip: 'Delete'},
        ]},
    ];

    private controlls = [
        {icon: 'plus', text: 'NEW', handler: () => this.addOffer() }
    ];

    private filtersSchema = [
        { name: 'name', type: 'text', text: 'Name' },
        { name: 'promo_code', type: 'text', text: 'Promo code' }
    ];

    editClick(offer: any){
        // @ts-ignore
        MxHelper.editOffer({ data: offer, id: offer.id });
    }

    async deleteClick(offer: any){
        const id = offer.id;
        Message.ask(`Do you realy want to delete offer "${offer.name}" ?`)
        .then((e: any) => {
            if(e.answer){
                e.loading();
                DM.deleteOffer(id).then(() =>  e.hide())
                .catch(err => {
                    console.error(err);
                    e.dialog.show('We could not complete the current action.');
                });
            }else{
                e.hide();
            }
        });
    }

    addOffer(){
        // @ts-ignore
        MxHelper.editOffer();
    }

}
</script>

