<template>
    <div class="column">
        <div class="title">{{ title }}</div>
        <table class="my-table">
            <thead>
                <tr>
                    <th class="first">Order #</th>
                    <th>Value</th>
                    <th>{{ detailsHead }}</th>
                    <th> </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="o in orders" :key="o.id">
                    <td class="first">{{ o.no }}</td>
                    <td style="color: red">{{ o.total | price }}</td>
                    <td style="white-space: pre-wrap">{{ o.details }}</td>
                    <td class="last">
                        <sui-button @click="$emit('itemEditClick', o)" tiny>
                            {{ buttonText }}
                        </sui-button>
                    </td>
                </tr>
                <tr v-if="orders.length == 0">
                    <td colspan="4">No recent orders</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: '',
        },
        detailsHead: {
            type: String,
            default: 'Details',
        },
        orders: {
            type: Array,
            default: () => []
        },
        buttonText: {
            type: String,
            default: 'Edit'
        }
    }
}
</script>

<style lang="scss" scoped>
.title{
    font-size: 24px;
    border-bottom: 1px solid #999;
    padding-bottom: 10px;
}
.my-table{
    width: 100%;
    border-collapse: collapse;
    td, th{
        padding: 5px;
    }
    td.first, th.first{
        padding-left: 10px;
    }
    td.last{
        text-align: right;
    }
    tbody tr{
        background-color: rgb(245, 245, 245);
    }
    tbody tr:nth-child(odd){
        background-color: rgb(238, 238, 238);
    }
}
</style>