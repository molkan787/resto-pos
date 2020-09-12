<template>
    <div class="root">
        <h2>Download Reports</h2>
        <hr>
        
        <sui-segments horizontal>
            <sui-segments vertical class="no-border">
                <sui-segment>
                    <h3>Daily Reports</h3>
                    <hr>
                    <LabeledInput label="Day" type="date" v-model="day2" :disabled="dg_daileSum"/>
                    <sui-button icon="download" @click="dailySummary"
                        :loading="dg_daileSum" :disabled="dg_daileSum">Download</sui-button>
                </sui-segment>

                <sui-segment>
                    <h3>Date Range Reports</h3>
                    <hr>
                    <LabeledInput label="Date from" type="date" v-model="date_from" :disabled="dg_weeklySum"/>
                    <LabeledInput label="Date to" type="date" v-model="date_to" :disabled="dg_weeklySum"/>
                    <sui-button icon="download" @click="weeklySummary"
                        :loading="dg_weeklySum" :disabled="dg_weeklySum">Download</sui-button>
                </sui-segment>
            </sui-segments>
            <sui-segment>
                <sui-segment class="no-border">
                    <!-- <h3>Cash out</h3>
                    <hr>
                    <sui-button @click="cashout">Cash out</sui-button> -->
                    <h3>Daily Stats</h3>
                    <hr>
                    <table class="stats-table">
                        <tbody>
                            <tr>
                                <th>Cash</th>
                                <th>Credit/Debit Card</th>
                            </tr>
                            <tr>
                                <td>{{ dailyStats.cash | price_m }}</td>
                                <td>{{ dailyStats.card | price_m }}</td>
                            </tr>
                        </tbody>
                    </table>
                </sui-segment>
            </sui-segment>
        </sui-segments>
        
        <!-- <div>*Reports function is progress</div> -->
        <!-- <sui-segment class="last-con">
            <h3>Manually addition of loyalty points</h3>
            <hr>
            <LabeledInput label="Date from" type="date" v-model="date_from2" :disabled="dg_loyaltyPoints"/>
            <LabeledInput label="Date to" type="date" v-model="date_to2" :disabled="dg_loyaltyPoints"/>
            <sui-button icon="download" @click="loyaltyPoints"
                :loading="dg_loyaltyPoints" :disabled="dg_loyaltyPoints">Download</sui-button>
        </sui-segment>
        
        <sui-segment class="last-con">
            <h3>Prepaid/Loyalty cards balance adjustment</h3>
            <hr>
            <LabeledDropdown :options="[{value: 'prepaid', text: 'Prepaid cards'}, {value: 'loyalty', text: 'Loyalty cards'}]" 
                :disabled="dg_balancesAdjust" v-model="card_type" label="Type"/>
            <LabeledInput label="Date from" type="date" v-model="date_from3" :disabled="dg_balancesAdjust"/>
            <LabeledInput label="Date to" type="date" v-model="date_to3" :disabled="dg_balancesAdjust"/>
            <sui-button icon="download" @click="balancesAdjust"
                :loading="dg_balancesAdjust" :disabled="dg_balancesAdjust">Download</sui-button>
        </sui-segment> -->

    </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Component from 'vue-class-component';
import LabeledInput from '../Elts/inputs/LabeledInput.vue';
import LabeledDropdown from '../Elts/inputs/LabeledDropdown.vue';
import Message from '@/ccs/Message';
import Reports from '@/prs/reports';
import MxHelper from '@/prs/MxHelper';
import { mapState } from 'vuex';

@Component({
    components: {
        LabeledInput,
        LabeledDropdown,
    },
    computed: mapState(['dailyStats'])
})
export default class ReportsTab extends Vue{
    private day: any = '';
    private day2: any = '';
    private date_from: any = '';
    private date_to: any = '';
    private date_from2: any = '';
    private date_to2: any = '';
    private date_from3: any = '';
    private date_to3: any = '';
    private card_type: string = 'prepaid';

    private dg_dailySales = false;
    private dg_daileSum = false;
    private dg_weeklySum = false;
    private dg_loyaltyPoints = false;
    private dg_balancesAdjust = false;

    private key_press_handler: Function = null;

    async cashout(){
        try {
            await MxHelper.confirmPassword(); // Throws execption if cancelled/password not confirmed
            MxHelper.openCashout();
        } catch (error) {
            
        }
    }

    dailySales(){
        if(this.checkForInputsErrors(this.day)) return;
        this.dg_dailySales = true;
        Reports.dailySales(this.day)
        .then(() => this.successMessage())
        .catch(() => this.failureMessage())
        .finally(() => this.dg_dailySales = false);
    }

    dailySummary(){
        if(this.checkForInputsErrors(this.day2)) return;
        this.dg_daileSum = true;
        Reports.dailySummary(this.day2)
        .then(() => this.successMessage())
        .catch(() => this.failureMessage())
        .finally(() => this.dg_daileSum = false);
    }

    weeklySummary(){
        if(this.checkForInputsErrors(this.date_from, this.date_to)) return;
        this.dg_weeklySum = true;
        Reports.weeklySummary(this.date_from, this.date_to)
        .then(() => this.successMessage())
        .catch(() => this.failureMessage())
        .finally(() => this.dg_weeklySum = false);
    }
    
    loyaltyPoints(){
        if(this.checkForInputsErrors(this.date_from2, this.date_to2)) return;
        this.dg_loyaltyPoints = true;
        Reports.loyaltyPoints(this.date_from2, this.date_to2)
        .then(() => this.successMessage())
        .catch(() => this.failureMessage())
        .finally(() => this.dg_loyaltyPoints = false);
    }

    balancesAdjust(){
        if(this.checkForInputsErrors(this.date_from3, this.date_to3)) return;
        this.dg_balancesAdjust = true;
        Reports.cardBalancesAdjust(this.date_from3, this.date_to3, this.card_type)
        .then(() => this.successMessage())
        .catch(() => this.failureMessage())
        .finally(() => this.dg_balancesAdjust = false);
    }

    checkForInputsErrors(a1?: any, a2?: any){
        for(let i = 0; i < arguments.length; i++){
            if(!arguments[i]){
                return true;
            }
        }
        return false;
    }

    successMessage(){
        Message.info('Report file was successfully downloaded and can be found inside folder "POS REPORTS" on your Desktop!')
        .then((e: any) => e.hide());
    }

    failureMessage(){
        Message.info('We could not generate reports, Please try again.')
        .then((e: any) => e.hide());
    }

    handleKeyPress(e){
        if(e.key == 'F8' && e.ctrlKey){
            this.cashout();
        }
    }

    resume(){
        window.addEventListener('keyup', this.key_press_handler);
    }

    pause(){
        window.removeEventListener('keyup', this.key_press_handler);
    }

    activated(){
        this.resume();
    }

    deactivated(){
        this.pause();
    }

    mounted(){
        Reports.loadDailyStats();
    }

    created(){
        this.key_press_handler = e => this.handleKeyPress(e);
        this.resume();
    }

    beforeDestroy(){
        this.pause();
    }

}
</script>

<style lang="scss" scoped>
.segments{
    box-shadow: none !important;
}
.segment{
    text-align: left;
}
hr{
    margin-bottom: 1rem;
}
.last-con{
    margin-bottom: 1rem !important;
}
.no-border, .no-border .segment{
    border: none !important;
}
.stats-table{
    border-collapse: collapse;
    min-width: 302px;
    th, td{
        border: 1px solid #DEDEDF;
        min-width: 150px;
    }
    th{
        font-size: 17px;
        padding: 10px 5px;
    }
    td{
        font-size: 26px;
        padding: 20px 5px;
    }
}
</style>
