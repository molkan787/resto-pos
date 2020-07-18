<template>
    <modal :open="open" :loading="loading" @okClick="okClick" @cancelClick="open = false"
        title="Add new Vendor" okText="Create" >
        <br>
        <VendorForm ref="form" />
    </modal>
</template>

<script>
import DataManager from '../services/data-manager';
import VendorForm from './forms/VendorForm';
export default {
    components: {
        VendorForm
    },
    data:() => ({
        open: false,
        loading: false,
    }),
    methods: {
        edit(vendor_id){
            this.open = true;
            if(this.$refs.form) this.$refs.form.clearData();
        },
        async okClick(){
            const form = this.$refs.form;
            const valid = form.validate();
            if(!valid) return;
            this.loading = true;
            try {
                await DataManager.editVendor('new', form.getTrimedData());
                await alert('Vendor was successfully created!', 'Success!');
                this.open = false;
            } catch (error) {
                console.error(error);
                alert('An error occured, Please check your internet connection and try again.', 'Error!');
            }
            this.loading = false;
        }
    }
}
</script>