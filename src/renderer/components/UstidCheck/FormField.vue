<template>
    <div class="field">

        <label class="label" :for="_uid">{{ label }}</label>

        <div class="control has-icons-right" v-bind:class="{'is-loading': loading}">
            <input type="text" :placeholder="placeholder" :id="_uid" v-bind:value="value" v-on:input="onInput($event.target.value)" class="input" v-bind:class="classObject" :disabled="loading">
            <span class="icon is-small is-right"><i class="fa fa-check"></i></span>
        </div>

    </div>

</template>

<script>
export default {
    name: 'form-field',
    props: ['value', 'label', 'loading', 'state', 'placeholder'],
    computed: {
        classObject () {
            return {
                'is-success': this.state == 'ok',
                'is-danger': this.state == 'error',
            }
        }
    },
    methods: {
        onInput (value) {
            this.$emit('input', value)
        }
    }
}

</script>

<style>
.control .icon i{
    visibility: hidden;
  }

  .is-success + .icon i{
    color:#23d160;
    visibility: visible;
  }

  .is-success {
    color:#23d160;
  }
</style>
