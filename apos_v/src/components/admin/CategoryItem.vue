<template>
    <div class="top-wrapper" :class="{ expanded }">
        <sui-button class="item" :class="myclasses" @click="itemClick">
            <sui-icon name="left trash" title="Delete"></sui-icon>
            <sui-icon name="left edit" title="Edit"></sui-icon>
            {{ data.name }}
            <sui-icon name="right chevron" v-if="data.id == currentCatId"></sui-icon>
        </sui-button>

        <div v-if="deepLevel == 0 && expanded" class="childs">
            <CategoryItem v-for="child in data.childs" :key="child.id"
                @itemClick="childItemClick" @deleteClick="childItemDeleteClick" @editClick="childItemEditClick"
                :data="child" :deepLevel="deepLevel + 1" :currentCatId="currentCatId" />
            <a href="#" class="add-btn" @click="addClick">
                <sui-icon name="plus" />
                Add sub-caregory
            </a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CategoryItem',
    props: {
        data: {
            type: Object,
            required: true,
        },
        deepLevel: {
            type: Number,
            default: 0,
        },
        currentCatId: {
            type: Number,
            default: -1,
        }
    },
    computed: {
        childsType(){
            return this.data.childs_type;
        },
        isCurrent(){
            return this.data.id == this.currentCatId;
        },
        myclasses(){
            return {
                ['level-' + this.deepLevel]: true,
                blue: this.isCurrent,
            }
        },
        expanded(){
            return this.isCurrent || this.childIsActive
        },
        childIsActive(){
            const childs = this.data.childs || []
            for(let i = 0; i < childs.length; i++){
                if(childs[i].id.toString() === this.currentCatId.toString()){
                    return true
                }
            }
            return false
        }
    },
    methods: {
        addClick(){
            this.$emit('addClick', this.data);
        },
        itemClick(event){
            if(event.target.classList.contains('trash')){
                this.$emit('deleteClick', this.data);
                return;
            }else if(event.target.classList.contains('edit')){
                this.$emit('editClick', this.data);
                return;
            }
            const noToggle = (this.currentCatId != this.data.id) && this.expanded;
            if(!noToggle){
                this.toggleExpand();
            }
            this.$emit('itemClick', this.data);
            // if(this.childsType == 1){
            //     this.toggleExpand();
            // }else{
            //     this.$emit('itemClick', this.data);
            // }
        },
        toggleExpand(){
            this.expanded = !this.expanded;
        },
        childItemClick(data){
            this.$emit('itemClick', data);
        },
        childItemDeleteClick(data){
            this.$emit('deleteClick', data);
        },
        childItemEditClick(data){
            this.$emit('editClick', data);
        }
    }
}
</script>

<style lang="scss" scoped>
.top-wrapper{
    border-radius: 3px;
    &.expanded{
        background-color: #a7c2ff;
    }
}
.item{
    width: 100%;
    margin-bottom: 0.3rem;
    font-size: 1.3rem;
    text-transform: uppercase;
    &.level-1:not(.blue){
        background-color: #efefef !important;
    }
    .left.icon{
        float: left;
        margin-left: -1.3rem !important;
        opacity: 0.5;
        transition: opacity 0.3s;
        &:hover{
            opacity: 1;
        }
        &.edit{
            margin-left: 0rem !important;
        }
    }
}
.childs{
    width: calc(100% - 3rem);
    margin: 1.5rem;
}
.add-btn{
    display: inline-block;
    padding: 0.5rem;
    font-size: 1.1rem;
    color: black;
    margin-bottom: 0.4rem;
}
</style>
