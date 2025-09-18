<template>
  <div class="flex border-b border-gray-2 mb-5 w-full">
    <div
      @click="changeType('account')"
      :class="['py-2 flex-1 px-4 text-center text-base font-medium transition-colors text-[#1A5EE4]', currentType === 'account' ? 'text-primary border-b-2 border-primary' : 'text-gray-5 hover:text-gray-9']"
    >
      账户密码登录
    </div>
    <div
      @click="changeType('phone')"
      :class="['py-2 flex-1 text-center px-4 text-base font-medium transition-colors text-[#1A5EE4]', currentType === 'phone' ? 'text-primary border-b-2 border-primary' : 'text-gray-5 hover:text-gray-9']"
    >
      手机号登录
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'account'
  }
})

const emits = defineEmits(['update:modelValue'])
const currentType = ref(props.modelValue)

const changeType = (type: string) => {
  currentType.value = type
  emits('update:modelValue', type)
}
</script>
