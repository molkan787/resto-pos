<template>
    <div>
        <v-text-field v-model="form.vendor_name" :error-messages="errors.name" label="Vendor name" placeholder="Vendor name" outlined dense />
        <v-text-field v-model="form.vendor_address" :error-messages="errors.address" label="Vendor address" placeholder="Vendor address" outlined dense />
        <v-text-field v-model="form.vendor_phone" :error-messages="errors.phone" label="Phone number" placeholder="Phone number" outlined dense />
        <v-text-field v-model="form.owner_fullname" :error-messages="errors.owner" label="Owner fullname" placeholder="Owner fullname" outlined dense />
        <v-text-field v-model="form.admin_password" :error-messages="errors.password" label="Admin's password" placeholder="The password to be used when logging into the POS app" outlined dense />
    </div>
</template>

<script>
export default {
    data: () => ({
        errors: {
            name: '',
            address: '',
            phone: '',
            owner: '',
            password: '',
        },
        form: {
            vendor_name: '',
            vendor_address: '',
            vendor_phone: '',
            owner_fullname: '',
            admin_password: '',
        },
        hasError: false,
    }),
    methods: {
        validate(){
            const data = this.getTrimedData();
            this.clearErrors();
            this.validateLength(data.vendor_name, 'name', 2, 200);
            this.validateLength(data.vendor_address, 'address', 2, 200);
            this.validateLength(data.vendor_phone, 'phone', 0, 200);
            this.validateLength(data.owner_fullname, 'owner', 0, 200);
            this.validateLength(data.admin_password, 'password', 6, 200);
            return !this.hasError;
        },
        validateLength(value, errorProp, minLength, maxLength){
            if(value.length < minLength || value.length > maxLength){
                this.errors[errorProp] = `The input value length need to be between ${minLength} and ${maxLength} characters`;
                this.hasError = true;
            }
        },
        clearErrors(){
            this.hasError = false;
            for(let p in this.errors){
                if(!this.errors.hasOwnProperty(p)) continue;
                this.errors[p] = '';
            }
        },
        getTrimedData(){
            const data = {};
            for(let p in this.form){
                if(!this.form.hasOwnProperty(p)) continue;
                data[p] = this.form[p].trim();
            }
            return data;
        },
        clearData(){
            for(let p in this.form){
                if(!this.form.hasOwnProperty(p)) continue;
                this.form[p] = '';
            }
        }
    }
}
</script>