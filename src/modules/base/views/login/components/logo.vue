<!--
 - MineAdmin is committed to providing solutions for quickly building web applications
 - Please view the LICENSE file that was distributed with this source code,
 - For the full copyright and license information.
 - Thank you very much for using MineAdmin.
 -
 - @Author X.Mo<root@imoi.cn>
 - @Link   https://github.com/mineadmin
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LogoSvg from '@/assets/images/logo.svg'
import { defineProps } from 'vue'

const { t } = useI18n()
const appTitle = ref<string>(import.meta.env.VITE_APP_TITLE)

// 接收外部传入的重置密码状态
const props = defineProps({
  isResetPassword: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="relative w-auto flex items-center gap-x-3 w-full">
    <!-- 根据状态显示不同标题 -->
    <div class="text-[24px] text-[#1A5EE4] lg:text-[#1A5EE4] text-center w-full">
      {{ isResetPassword ? '重置密码' : '客户服务管理系统' }}
    </div>
  </div>
</template>
