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
import './style.scss'
import Dashed from './components/dashed.vue'
import Light from './components/light.vue'
import Logo from './components/logo.vue'
import LoginForm from './components/login-form.vue'
// 定义重置密码状态，供 Logo 和 LoginForm 共享
const isResetPassword = ref(false)

// 提供修改状态的方法给子组件
const setResetPassword = (status: boolean) => {
  isResetPassword.value = status
}
</script>

<template>
  <div
    class="h-full min-w-[380px] w-full flex items-center justify-center overflow-hidden border-1 lg:justify-between bgc_box"
  >
    <div class="relative hidden h-full w-10/12 md:hidden lg:flex">
      <div class="gradient-rainbow" />
    </div>
    <div class="login-form-container">
      <Logo :is-reset-password="isResetPassword" />
      <LoginForm :is-reset-password="isResetPassword" @update:isResetPassword="setResetPassword" />
      <!-- <CopyRight /> -->
    </div>
    <!-- 下面兼容移动端的 -->
    <div class="min-[380px] relative left-0 top-0 z-4 h-full max-w-[1024px] w-full flex lg:hidden">
      <Dashed />
      <Light />
    </div>
  </div>
</template>
