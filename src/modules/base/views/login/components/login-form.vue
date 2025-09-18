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
import Message from 'vue-m-message'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/store/modules/useUserStore.ts'
import useSettingStore from '@/store/modules/useSettingStore.ts'
import loginTab from './login-tab.vue'
const { t } = useI18n()
const isProduction: boolean = import.meta.env.MODE === 'production'
const userStore = useUserStore()
const settingStore = useSettingStore()
const router = useRouter()
const isFormSubmit = ref(false)
const isValidState = ref(true)
const codeRef = ref()

// 登录类型：account-账户登录，phone-手机号登录
const loginType = ref('account')

const form = reactive<{
  username: string
  password: string
  code: string
  phone?: any
  smsCode?: string | number
}>({
  username: isProduction ? '' : 'admin',
  password: isProduction ? '' : '123456',
  code: isProduction ? '' : '1234',
  phone: '',
  smsCode: ''
})
// 获取短信验证码方法
const getSmsCode = () => {
  if (!/^1[3-9]\d{9}$/.test(form.phone || '')) {
    Message.error('请输入正确的手机号')
    return
  }

  // 这里添加获取短信验证码的接口调用逻辑
  Message.success('验证码已发送，5分钟内有效')
}

// 简单验证
function easyValidate(event: Event) {
  const dom = event?.target as HTMLInputElement
  if (form[dom.name] === undefined || form[dom.name] === '') {
    dom.classList.add('!ring-red-5')
    Message.error(t(`loginForm.${dom.name}Placeholder`))
    isValidState.value = false
  } else {
    dom.classList.remove('!ring-red-5')
    isValidState.value = true
  }
}


// 登录提交处理
async function submit() {
  isValidState.value = true

  // 根据登录类型进行验证
  if (loginType.value === 'account') {
    // 账户登录验证
    if (!form.username) {
      Message.error(t('loginForm.usernamePlaceholder'))
      isValidState.value = false
    }
    if (!form.password) {
      Message.error(t('loginForm.passwordPlaceholder'))
      isValidState.value = false
    }
  } else {
    // 手机号登录验证
    if (!form.phone) {
      Message.error('请输入手机号')
      isValidState.value = false
    } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      Message.error('请输入正确的手机号')
      isValidState.value = false
    }

    if (!form.smsCode) {
      Message.error('请输入短信验证码')
      isValidState.value = false
    }
  }

  // 验证码验证（生产环境）
  if (isProduction && !codeRef.value?.checkResult(form.code)) {
    Message.error(t('loginForm.codeError'))
    form.code = ''
    return
  }

  if (!isValidState.value) return

  isFormSubmit.value = true
  try {
    // 根据登录类型准备不同的登录数据
    const loginData = loginType.value === 'account'
      ? { username: form.username, password: form.password }
      : { phone: form.phone, sms_code: form.smsCode }

    // 调用登录接口
    const userData = await userStore.login(loginData)

    // 登录成功后的处理
    if (userData) {
      Message.success(t('loginForm.loginSuccess'))
      // 跳转到首页或其他页面
      router.push('/')
    }
  } catch (err) {
    Message.error(err instanceof Error ? err.message : t('loginForm.loginFailed'))
  } finally {
    isFormSubmit.value = false
  }
}
</script>

<template>
  <form class="mine-login-form" @submit.prevent="submit">
    <!-- 新增登录类型切换 -->
    <login-tab v-model="loginType" />

    <!-- 账户登录表单 -->
    <template v-if="loginType === 'account'">
      <div class="mine-login-form-item">
        <div class="mine-login-form-item-title">
          {{ t('loginForm.usernameLabel') }}
        </div>
        <m-input
          v-model="form.username"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          name="username"
          :placeholder="t('loginForm.usernamePlaceholder')"
          @blur="easyValidate"
        />
      </div>
      <div class="mine-login-form-item">
        <div class="mine-login-form-item-title">
          {{ t('loginForm.passwordLabel') }}
        </div>
        <m-input
          v-model="form.password"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          name="password"
          type="password"
          :placeholder="t('loginForm.passwordPlaceholder')"
          @blur="easyValidate"
        />
      </div>
    </template>

     <!-- 手机号登录表单 -->
    <template v-else>
      <div class="mine-login-form-item">
        <div class="mine-login-form-item-title">手机号</div>
        <m-input
          v-model="form.phone"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          name="phone"
          placeholder="请输入手机号"
          maxlength="11"
          @blur="
            e => {
              if (!form.phone) {
                Message.error('请输入手机号')
              } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
                Message.error('请输入正确的手机号')
              }
            }
          "
        />
      </div>
      <div class="mine-login-form-item">
        <div class="mine-login-form-item-title">短信验证码</div>
        <m-input
          v-model="form.smsCode"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          name="smsCode"
          placeholder="请输入验证码"
        >
          <template #suffix>
            <button
              type="button"
              class="ml-2 px-2 text-sm text-primary"
              @click="getSmsCode"
              :disabled="!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)"
            >
              获取验证码
            </button>
          </template>
        </m-input>
      </div>
    </template>
    <!-- 验证码（生产环境显示） -->
    <!-- <div v-if="isProduction" class="mine-login-form-item">
      <div class="mine-login-form-item-title">
        {{ t('loginForm.codeLabel') }}
      </div>
      <m-input
        v-model="form.code"
        class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
        name="code"
        :placeholder="t('loginForm.codePlaceholder')"
        @blur="easyValidate"
      >
        <template #suffix>
          <div class="ml-0.5 w-30 flex items-center justify-center text-sm">
            <ma-verify-code ref="codeRef" />
          </div>
        </template>
      </m-input>
    </div> -->
     <!-- 登录按钮 -->
    <div class="mine-login-form-item mt-2">
      <m-button
        type="submit"
        class="!bg-[rgb(var(--ui-primary))] !text-gray-1 !active-bg-[rgb(var(--ui-primary))] !hover-bg-[rgb(var(--ui-primary)/.75)]"
        :class="{
          // 'py-3': userStore.getLanguage() === 'en',
          loading: isFormSubmit
        }"
      >
        <ma-svg-icon name="formkit:submit" /> {{ t('loginForm.loginButton') }}
      </m-button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.loading {
  @apply cursor-wait;

  background-color: rgb(var(--ui-primary) / 45%) !important;
}
</style>
