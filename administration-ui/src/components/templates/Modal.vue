<template>
    <v-dialog v-model="open" :width="width" persistent>
        <v-card>
            <v-card-title>{{ title }}</v-card-title>
            <v-card-text>
                <slot></slot>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="$emit('cancelClick')">
                    {{ cancelText }}
                </v-btn>
                <v-btn text color="primary" @click="$emit('okClick')">
                    {{ okText }}
                </v-btn>
            </v-card-actions>
            <v-overlay :value="loading" color="white" absolute>
                <v-progress-circular indeterminate color="primary" />
            </v-overlay>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        open: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Title'
        },
        okText: {
            type: String,
            default: 'Ok'
        },
        cancelText: {
            type: String,
            default: 'Cancel'
        },
        width: {
            type: String,
            default: '500',
        }
    }
}
</script>