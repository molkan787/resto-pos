<template>
    <div class="ui attached vertical segment no-padding">

        <!-- <sui-segment attached class="padding-2">
            <TripleButton :texts="['REGULAR WASH','PREPAID WASH','NEW LOYALTY CARD']"
                :colors="['blue', 'red', 'green']" :icons="icons" @click="buttonClicked" />
        </sui-segment> -->

        <sui-segment attached class="col-block">
            <AreaA />
        </sui-segment>
        <!-- <sui-segment attached class="row2-block">
            <Stats />
        </sui-segment> -->
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {mapState, mapActions} from 'vuex';
import Component from 'vue-class-component';
import PredefinedOrder from '@/prs/predefinedOrder';
import MxHelper from '@/prs/MxHelper';
import TripleButton from '../Elts/TripleButton.vue';
import AreaA from './AreaA/AreaA.vue';
import Stats from './Stats/Stats.vue';

@Component({
    components: {
        TripleButton,
        AreaA,
        Stats,
    },
    computed: mapState(['pos']),
    methods: mapActions(['setCatType']),
})
export default class LeftColumn extends Vue{
}
</script>