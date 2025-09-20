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
import { GoodsFilled, UserFilled, Checked, Clock } from '@element-plus/icons-vue'
import Message from 'vue-m-message'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/store/modules/useUserStore.ts'
import useSettingStore from '@/store/modules/useSettingStore.ts'
import useHttp from '@/hooks/auto-imports/useHttp.ts'
import loginTab from './login-tab.vue'
import { onMounted, watch, onUnmounted, reactive } from 'vue'

const { t } = useI18n()
const http = useHttp()
const isProduction: boolean = import.meta.env.MODE === 'production'
const userStore = useUserStore()
const settingStore = useSettingStore()
const router = useRouter()
const isFormSubmit = ref(false)
const isValidState = ref(true)

let checked1 = ref<any>(false)
let checked2 = ref<any>(true)
// 登录类型：account-账户登录，phone-手机号登录
const loginType = ref('account')
const isResetPassword = ref(false) // 是否显示重置密码表单
const resetForm = reactive({
  phone: '',
  smsCode: '',
  password: '',
  confirmPassword: ''
})
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

// 验证状态管理 - 用于存储每个字段的验证信息
const formState = reactive({
  username: { valid: true, message: '' },
  password: { valid: true, message: '' },
  phone: { valid: true, message: '' },
  smsCode: { valid: true, message: '' },
  resetPhone: { valid: true, message: '' },
  resetSmsCode: { valid: true, message: '' },
  resetPassword: { valid: true, message: '' },
  resetConfirmPassword: { valid: true, message: '' }
})

// 验证码倒计时状态
const resetCountdown = ref(0) // 重置密码验证码
const countdown = ref(0)

const isCounting = ref(false)
const isResetCounting = ref(false) // 重置密码验证码

let timer: any | null = null // 用于存储定时器
let resetTimer: any | null = null // 重置密码验证码定时器

// 自动登录相关配置
const AUTO_LOGIN_KEY = 'auto_login_info' // 缓存键名

// 简单的加密函数 - 使用Base64
const encode = (str: string): string => {
  if (!str) return ''
  try {
    return btoa(encodeURIComponent(str))
  } catch (e) {
    console.error('加密失败:', e)
    return ''
  }
}

// 简单的解密函数 - 使用Base64
const decode = (str: string): string => {
  if (!str) return ''
  try {
    return decodeURIComponent(atob(str))
  } catch (e) {
    console.error('解密失败:', e)
    return ''
  }
}

// 从localStorage获取缓存
const getCache = (key: string) => {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(key)
}

// 向localStorage设置缓存
const setCache = (key: string, value: string) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, value)
}

// 从localStorage移除缓存
const removeCache = (key: string) => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(key)
}

// 初始化时从缓存读取自动登录信息
onMounted(() => {
  try {
    const cachedInfo = getCache(AUTO_LOGIN_KEY)
    if (cachedInfo) {
      const { username, password, loginType: cachedType } = JSON.parse(decode(cachedInfo))

      // 填充对应表单
      if (cachedType === 'account' && username && password) {
        form.username = username
        form.password = password
        loginType.value = 'account'
      } else if (cachedType === 'phone' && username) {
        form.phone = username
        loginType.value = 'phone'
      }

      // 自动勾选"自动登录"
      checked1.value = true
    }
  } catch (err) {
    console.error('读取自动登录缓存失败:', err)
    removeCache(AUTO_LOGIN_KEY)
  }
})

// 监听"自动登录"勾选状态变化
watch(checked1, isChecked => {
  if (!isChecked) {
    removeCache(AUTO_LOGIN_KEY)
  } else {
    // 勾选时保存当前表单信息
    saveAutoLoginInfo()
  }
})

// 监听表单变化，自动更新缓存
watch(
  [() => form.username, () => form.password, () => form.phone, () => loginType.value],
  () => {
    if (checked1.value) {
      saveAutoLoginInfo()
    }
  },
  { deep: true }
)

// 接收父组件传入的状态
const props = defineProps({
  isResetPassword: {
    type: Boolean,
    default: false
  }
})
const goToResetPassword = () => {
  emit('update:isResetPassword', true)
  isResetPassword.value = true
}

// 定义更新状态的事件
const emit = defineEmits(['update:isResetPassword'])

// 切换回登录表单
const goToLogin = () => {
  emit('update:isResetPassword', false)
  isResetPassword.value = false
  loginType.value = 'account'
  // 重置验证状态
  Object.keys(formState).forEach(key => {
    formState[key as keyof typeof formState] = { valid: true, message: '' }
  })
}

// 密码校验规则
const validatePassword = (password: string) => {
  // 至少6位，区分大小写（只要包含大小写字母即可满足区分大小写要求）
  const reg = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/
  return reg.test(password)
}

// 实时校验密码
const checkPasswordOnInput = (value: string) => {
  const isValid = validatePassword(value)
  formState.resetPassword = {
    valid: isValid || !value,
    message: !isValid && value ? '密码至少6位且需包含大小写字母' : ''
  }
  return isValid
}

// 保存自动登录信息到缓存（加密存储）
const saveAutoLoginInfo = () => {
  let info = {}

  // 区分登录类型：账户登录缓存"用户名+密码"，手机号登录仅缓存"手机号"
  if (loginType.value === 'account') {
    // 账户登录：仅当用户名和密码都存在时才缓存
    if (form.username && form.password) {
      info = {
        loginType: 'account',
        username: form.username,
        password: form.password // 加密存储
      }
    }
  } else {
    // 手机号登录：仅缓存手机号（验证码时效性强，无需缓存）
    if (form.phone) {
      info = {
        loginType: 'phone',
        username: form.phone, // 用username字段统一存储"账号标识"
        password: '' // 手机号登录无固定密码，留空
      }
    }
  }

  // 加密并存储（若info为空，清除缓存）
  if (Object.keys(info).length > 0) {
    setCache(AUTO_LOGIN_KEY, encode(JSON.stringify(info)))
  } else {
    removeCache(AUTO_LOGIN_KEY)
  }
}

// 重置密码提交
const submitReset = async () => {
  // 验证所有字段
  let isFormValid = true

  // 验证手机号
  if (!resetForm.phone) {
    formState.resetPhone = { valid: false, message: '请输入手机号' }
    isFormValid = false
  } else if (!/^1[3-9]\d{9}$/.test(resetForm.phone)) {
    formState.resetPhone = { valid: false, message: '请输入正确的手机号' }
    isFormValid = false
  } else {
    formState.resetPhone = { valid: true, message: '' }
  }

  // 验证验证码
  if (!resetForm.smsCode) {
    formState.resetSmsCode = { valid: false, message: '请输入验证码' }
    isFormValid = false
  } else {
    formState.resetSmsCode = { valid: true, message: '' }
  }

  // 验证密码
  if (!resetForm.password) {
    formState.resetPassword = { valid: false, message: '请输入密码' }
    isFormValid = false
  } else if (!validatePassword(resetForm.password)) {
    formState.resetPassword = { valid: false, message: '密码至少6位且需包含大小写字母' }
    isFormValid = false
  } else {
    formState.resetPassword = { valid: true, message: '' }
  }

  // 验证确认密码
  if (!resetForm.confirmPassword) {
    formState.resetConfirmPassword = { valid: false, message: '请确认密码' }
    isFormValid = false
  } else if (resetForm.password !== resetForm.confirmPassword) {
    formState.resetConfirmPassword = { valid: false, message: '两次密码不一样，请重新输入' }
    isFormValid = false
  } else {
    formState.resetConfirmPassword = { valid: true, message: '' }
  }

  if (!isFormValid) return

  // 提交重置密码逻辑
  try {
    isFormSubmit.value = true
    // 调用重置密码接口
    await http.put('/admin/passport/change-password-by-phone', {
      phone: resetForm.phone,
      code: resetForm.smsCode,
      password: resetForm.password,
      password_confirmation: resetForm.confirmPassword
    })
    Message.success('密码重置成功，请使用新密码登录')
    isResetPassword.value = false // 重置成功后返回登录表单
    loginType.value = 'account'
    // 清空表单
    resetForm.phone = ''
    resetForm.smsCode = ''
    resetForm.password = ''
    resetForm.confirmPassword = ''
    form.password = ''
    removeCache(AUTO_LOGIN_KEY)
    checked1.value = false
    // 重置验证状态
    Object.keys(formState).forEach(key => {
      formState[key as keyof typeof formState] = { valid: true, message: '' }
    })
  } catch (err: any) {
    Message.error(
      err?.response?.data?.message || err instanceof Error ? err.message : '密码重置失败'
    )
  } finally {
    isFormSubmit.value = false
  }
}

// 获取短信验证码方法 - 对接接口
const getSmsCode = async () => {
  // 验证手机号格式
  const phone = isResetPassword.value ? resetForm.phone : form.phone
  if (!phone) {
    formState.phone = { valid: false, message: '请输入手机号' }
    return
  } else if (!/^1[3-9]\d{9}$/.test(phone)) {
    formState.phone = { valid: false, message: '请输入正确的手机号' }
    return
  } else {
    formState.phone = { valid: true, message: '' }
  }

  try {
    // 防止重复点击
    if (isCounting.value) return

    // 开始倒计时
    countdown.value = 60
    isCounting.value = true

    // 调用获取验证码接口
    let res = await http.post('/admin/passport/send-sms-code', {
      phone: phone
    })
    Message.success((res as any).message || '验证码已发送，5分钟内有效')
    // 清除可能存在的旧定时器
    if (timer) clearInterval(timer)

    // 倒计时逻辑
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer as any)
        isCounting.value = false
        timer = null
      }
    }, 1000)
  } catch (error: any) {
    // 接口调用失败时重置倒计时
    isCounting.value = false
    countdown.value = 0
    if (timer) {
      clearInterval(timer)
      timer = null
    }

    // 错误信息处理
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : '获取验证码失败，请重试'

    Message.error(errorMsg)
  }
}

// 输入框失焦验证
function easyValidate(event: Event) {
  const dom = event?.target as HTMLInputElement
  const fieldName = dom.name
  const fieldValue = form[fieldName as keyof typeof form]
   // 明确类型定义
  type ValidationRule = {
    required?: boolean
    pattern?: RegExp
    message: string
    emptyMessage?: string
  }
  // 验证规则映射
   const validationRules: Record<string, ValidationRule> =  {
    username: {
      required: true,
      message: '请输入用户名'
    },
    password: {
      required: true,
      message: '请输入密码'
    },
    phone: {
      required: true,
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      emptyMessage: '请输入手机号'
    },
    smsCode: {
      required: true,
      message: '请输入验证码'
    }
  }

  // 执行验证
  if (validationRules[fieldName as keyof typeof validationRules]) {
    const rule = validationRules[fieldName as keyof typeof validationRules]

    // 非空验证
    if (rule.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      formState[fieldName as keyof typeof formState] = {
        valid: false,
        message: rule.emptyMessage || rule.message
      }
      isValidState.value = false
      return
    }

    // 格式验证
    if (rule.pattern && fieldValue && !rule.pattern.test(fieldValue.toString())) {
      formState[fieldName as keyof typeof formState] = {
        valid: false,
        message: rule.message
      }
      isValidState.value = false
      return
    }
  }

  // 验证通过
  formState[fieldName as keyof typeof formState] = {
    valid: true,
    message: ''
  }
  isValidState.value = true
}

// 重置密码表单字段验证
function validateResetField(fieldName: string, value: any) {
  switch (fieldName) {
    case 'phone':
      if (!value) {
        formState.resetPhone = { valid: false, message: '请输入手机号' }
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        formState.resetPhone = { valid: false, message: '请输入正确的手机号' }
      } else {
        formState.resetPhone = { valid: true, message: '' }
      }
      break
    case 'smsCode':
      formState.resetSmsCode = !value
        ? { valid: false, message: '请输入验证码' }
        : { valid: true, message: '' }
      break
    case 'password':
      if (!value) {
        formState.resetPassword = { valid: false, message: '请输入密码' }
      } else if (!validatePassword(value)) {
        formState.resetPassword = { valid: false, message: '密码至少6位且需包含大小写字母' }
      } else {
        formState.resetPassword = { valid: true, message: '' }
      }
      // 检查确认密码
      if (resetForm.confirmPassword) {
        validateResetField('confirmPassword', resetForm.confirmPassword)
      }
      break
    case 'confirmPassword':
      if (!value) {
        formState.resetConfirmPassword = { valid: false, message: '请确认密码' }
      } else if (value !== resetForm.password) {
        formState.resetConfirmPassword = { valid: false, message: '两次密码不一样，请重新输入' }
      } else {
        formState.resetConfirmPassword = { valid: true, message: '' }
      }
      break
  }
}

// 获取重置密码短信验证码方法
const getResetSmsCode = async () => {
  validateResetField('phone', resetForm.phone)

  if (!formState.resetPhone.valid) {
    return
  }

  try {
    // 防止重复点击
    if (isResetCounting.value) return

    // 开始倒计时
    resetCountdown.value = 60
    isResetCounting.value = true

    // 调用重置密码验证码接口
    const res = await http.post('/admin/passport/send-sms-code-forget', {
      phone: resetForm.phone
    })

    Message.success((res as any).message || '验证码已发送，5分钟内有效')

    // 清除可能存在的旧定时器
    if (resetTimer) clearInterval(resetTimer)

    // 倒计时逻辑
    resetTimer = setInterval(() => {
      resetCountdown.value--
      if (resetCountdown.value <= 0) {
        clearInterval(resetTimer as any)
        isResetCounting.value = false
        resetTimer = null
      }
    }, 1000)
  } catch (error: any) {
    // 接口调用失败时重置倒计时
    isResetCounting.value = false
    resetCountdown.value = 0
    if (resetTimer) {
      clearInterval(resetTimer)
      resetTimer = null
    }

    // 错误信息处理
    const errorMsg =
      error?.response?.data?.message || error instanceof Error
        ? error.message
        : '获取验证码失败，请重试'

    Message.error(errorMsg)
  }
}

// 登录提交处理
async function submit() {
  isValidState.value = true
  let isFormValid = true

  // 根据登录类型进行验证
  if (loginType.value === 'account') {
    // 账户登录验证
    if (!form.username) {
      formState.username = { valid: false, message: '请输入用户名' }
      isFormValid = false
    } else {
      formState.username = { valid: true, message: '' }
    }

    if (!form.password) {
      formState.password = { valid: false, message: '请输入密码' }
      isFormValid = false
    } else {
      formState.password = { valid: true, message: '' }
    }
  } else {
    // 手机号登录验证
    if (!form.phone) {
      formState.phone = { valid: false, message: '请输入手机号' }
      isFormValid = false
    } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      formState.phone = { valid: false, message: '请输入正确的手机号' }
      isFormValid = false
    } else {
      formState.phone = { valid: true, message: '' }
    }

    if (!form.smsCode) {
      formState.smsCode = { valid: false, message: '请输入短信验证码' }
      isFormValid = false
    } else {
      formState.smsCode = { valid: true, message: '' }
    }
  }

  if (!isFormValid) return

  isFormSubmit.value = true
  try {
    // 根据登录类型准备不同的登录数据
    const loginData =
      loginType.value === 'account'
        ? { username: form.username, password: form.password }
        : { phone: form.phone, code: form.smsCode }

    // 调用登录接口
    const userData = await userStore.login(loginData as any)

    // 登录成功后的处理
    if (userData) {
      // 如果勾选了自动登录，保存信息到缓存
      if (checked1.value) {
        saveAutoLoginInfo()
      } else {
        // 未勾选则清除缓存
        removeCache(AUTO_LOGIN_KEY)
      }

      Message.success(t('登陆成功'))
      // 获取用户信息并初始化
      await userStore.requestUserInfo()
      // 跳转到首页或其他页面
      router.push('/')
    }
  } catch (err: any) {
    // 错误信息处理
    const errorMsg =
      err?.response?.data?.message || err instanceof Error
        ? err.message
        : t('loginForm.loginFailed')
    Message.error(errorMsg)
  } finally {
    isFormSubmit.value = false
  }
}

const submit1 = () => {
  if (!checked2.value) {
    Message.error(t('请先阅读服务条款和隐私协议'))
    return
  }
  isResetPassword.value ? submitReset() : submit()
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (resetTimer) {
    clearInterval(resetTimer)
  }
})
</script>

<template>
  <!-- isResetPassword ? submitReset : submit -->

  <form class="mine-login-form" @submit.prevent="submit1">
    <!-- 登录表单 -->
    <template v-if="!isResetPassword">
      <!-- 新增登录类型切换 -->
      <login-tab v-model="loginType" />
      <!-- 账户登录表单 -->
      <template v-if="loginType === 'account'">
        <div class="mine-login-form-item relative">
          <el-input
            v-model="form.username"
            class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
            :class="{ '!ring-red-5': !formState.username.valid }"
            name="username"
            :placeholder="t('loginForm.usernamePlaceholder')"
            @blur="easyValidate"
          >
            <template #prefix>
              <UserFilled class="w-4 h-4 text-[#1A5EE4]" />
            </template>
          </el-input>
          <div
            v-if="!formState.username.valid"
            class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]"
          >
            {{ formState.username.message }}
          </div>
        </div>
        <div class="mine-login-form-item relative">
          <el-input
            v-model="form.password"
            class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
            :class="{ '!ring-red-5': !formState.password.valid }"
            name="password"
            type="password"
            show-password
            :placeholder="t('loginForm.passwordPlaceholder')"
            @blur="easyValidate"
          >
            <!-- 在这里添加前缀图标 -->
            <template #prefix>
              <GoodsFilled class="w-4 h-4 text-[#1A5EE4]" />
            </template>
          </el-input>
          <div
            v-if="!formState.password.valid"
            class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]"
          >
            {{ formState.password.message }}
          </div>
        </div>
        <div class="flex justify-between mt-[-22px]">
          <div class="flex items-center text-[#1A5EE4] text-base">
            <el-checkbox v-model="checked1" label="" size="large" /> 自动登录
          </div>
          <div @click="goToResetPassword" class="text-base text-[#E24242]">忘记密码</div>
        </div>
      </template>

      <!-- 手机号登录表单 -->
      <template v-else>
        <div class="mine-login-form-item relative">
          <el-input
            v-model="form.phone"
            class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4 "
            :class="{ '!ring-red-5': !formState.phone.valid }"
            name="phone"
            placeholder="请输入手机号"
            maxlength="11"
            @blur="easyValidate"
          >
            <template #prefix>
              <UserFilled class="w-4 h-4 text-[#1A5EE4]" />
            </template>
          </el-input>
          <div
            v-if="!formState.phone.valid"
            class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]"
          >
            {{ formState.phone.message }}
          </div>
        </div>
        <div class="mine-login-form-item w-full relative">
          <div class="flex flex-row items-center justify-between w-full">
            <el-input
              v-model="form.smsCode"
              class="!bg-white flex-1 !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
              :class="{ '!ring-red-5': !formState.smsCode.valid }"
              name="smsCode"
              placeholder="请输入验证码"
              @blur="easyValidate"
            >
              <template #prefix>
                <Checked class="w-4 h-4 text-[#1A5EE4]" />
              </template>
            </el-input>
            <el-button
              type="primary"
              class="h-[50px] ml-[20px]"
              @click="getSmsCode"
              :disabled="!form.phone || !/^1[3-9]\d{9}$/.test(form.phone) || isCounting"
            >
              <Clock v-if="isCounting" class="mr-1 h-4 w-4" />
              {{ isCounting ? `${countdown}s后重新获取` : '获取验证码' }}
            </el-button>
          </div>
          <div
            v-if="!formState.smsCode.valid"
            class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]"
          >
            {{ formState.smsCode.message }}
          </div>
        </div>
        <div class="flex justify-between mt-[-22px]">
          <div class="flex items-center text-[#1A5EE4] text-base">
            <el-checkbox v-model="checked1" label="" size="large" /> 自动登录
          </div>
          <div @click="isResetPassword = true" class="text-base text-[#E24242]">忘记密码</div>
        </div>
      </template>

      <!-- 登录按钮 -->
      <div class="mine-login-form-item mt-2">
        <m-button
          type="submit"
          class="text-[20px] h-[50px] !bg-[rgb(var(--ui-primary))] !text-gray-1 !active-bg-[rgb(var(--ui-primary))] !hover-bg-[rgb(var(--ui-primary)/.75)]"
          :class="{
            loading: isFormSubmit
          }"
        >
          {{ t('loginForm.loginButton') }}
        </m-button>
      </div>
    </template>

    <!-- 重置密码表单 -->
    <template v-if="isResetPassword">
      <!-- 手机号输入 -->
      <div class="mine-login-form-item relative">
        <el-input
          v-model="resetForm.phone"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          :class="{ '!ring-red-5': !formState.resetPhone.valid }"
          placeholder="请输入手机号"
          maxlength="11"
          @blur="() => validateResetField('phone', resetForm.phone)"
        >
          <template #prefix>
            <UserFilled class="w-4 h-4 text-[#1A5EE4]" />
          </template>
        </el-input>
        <div v-if="!formState.resetPhone.valid" class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]">
          {{ formState.resetPhone.message }}
        </div>
      </div>

      <!-- 验证码输入 -->
      <div class="mine-login-form-item w-full relative">
        <div class="flex flex-row items-center justify-between w-full">
          <el-input
            v-model="resetForm.smsCode"
            class="!bg-white flex-1 !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
            :class="{ '!ring-red-5': !formState.resetSmsCode.valid }"
            name="smsCode"
            placeholder="请输入验证码"
            @blur="() => validateResetField('smsCode', resetForm.smsCode)"
          >
            <template #prefix>
              <Checked class="w-4 h-4 text-[#1A5EE4]" />
            </template>
          </el-input>
          <el-button
            type="primary"
            class="h-[50px] ml-[20px]"
            @click="getResetSmsCode"
            :disabled="
              !resetForm.phone || !/^1[3-9]\d{9}$/.test(resetForm.phone) || isResetCounting
            "
          >
            <Clock v-if="isResetCounting" class="mr-1 h-4 w-4" />
            {{ isResetCounting ? `${resetCountdown}s后重新获取` : '获取验证码' }}
          </el-button>
        </div>
        <div v-if="!formState.resetSmsCode.valid" class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]">
          {{ formState.resetSmsCode.message }}
        </div>
      </div>

      <!-- 密码输入 -->
      <div class="mine-login-form-item relative">
        <el-input
          @input="checkPasswordOnInput(resetForm.password)"
          @blur="() => validateResetField('password', resetForm.password)"
          v-model="resetForm.password"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          :class="{ '!ring-red-5': !formState.resetPassword.valid }"
          type="password"
          show-password
          placeholder="请输入密码（至少6位，包含大小写字母）"
        >
          <template #prefix>
            <GoodsFilled class="w-4 h-4 text-[#1A5EE4]" />
          </template>
        </el-input>
        <div
          v-if="!formState.resetPassword.valid"
          class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]"
        >
          {{ formState.resetPassword.message }}
        </div>
      </div>

      <!-- 确认密码输入 -->
      <div class="mine-login-form-item relative">
        <el-input
          show-password
          @blur="() => validateResetField('confirmPassword', resetForm.confirmPassword)"
          v-model="resetForm.confirmPassword"
          class="!bg-white !text-black !ring-gray-2 !focus-ring-[rgb(var(--ui-primary))] !placeholder-stone-4"
          :class="{ '!ring-red-5': !formState.resetConfirmPassword.valid }"
          type="password"
          placeholder="请确认密码"
        >
          <template #prefix>
            <GoodsFilled class="w-4 h-4 text-[#1A5EE4]" />
          </template>
        </el-input>
        <div v-if="!formState.resetConfirmPassword.valid" class="text-red-500 text-sm mt-1 pl-1 absolute top-[100%]">
          {{ formState.resetConfirmPassword.message }}
        </div>
      </div>

      <!-- 确认重置按钮 -->
      <div class="mine-login-form-item mt-2">
        <m-button
          type="submit"
          class="text-[20px] h-[50px] !bg-[rgb(var(--ui-primary))] !text-gray-1 !active-bg-[rgb(var(--ui-primary))] !hover-bg-[rgb(var(--ui-primary)/.75)]"
          :class="{ loading: isFormSubmit }"
        >
          确认重置
        </m-button>
      </div>

      <!-- 返回登录链接 -->
      <div class="text-center mt-4">
        <span class="text-[#5D7085]">记起密码</span>
        <span class="text-[#1A5EE4] cursor-pointer ml-1" @click="goToLogin"> 直接登录 </span>
      </div>
    </template>

    <template v-if="!isResetPassword">
      <div class="mine-login-form-item mt-2">
        <div class="line"></div>
      </div>
      <div class="mine-login-form-item mt-2 text-[#5D7085] flex items-center justify-center">
        <el-checkbox
          v-model="checked2"
          label="我已阅读并同意《服务条款》和《隐私协议》"
          size="large"
        />
      </div>
    </template>
  </form>
</template>
<style scoped lang="scss">
.loading {
  @apply cursor-wait;
  background-color: rgb(var(--ui-primary) / 45%) !important;
}
/* 默认状态边框颜色 */
::v-deep .el-input__wrapper {
  box-shadow: 0 0 0 1px #1a5ee4 !important;
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}

/* 聚焦状态边框颜色 */
.el-input__inner:focus {
  border-color: #1a5ee4;
}

/* 禁用状态边框颜色 */
.el-input.is-disabled .el-input__inner {
  border-color: #1a5ee4;
}

/* 错误状态样式 */
::v-deep .ring-red-5 {
  --el-input-border-color: #ff4d4f !important;
  box-shadow: 0 0 0 1px #ff4d4f !important;
}

/* 错误提示信息样式 - 固定高度解决抖动问题 */
.text-red-500 {
  color: #ff4d4f !important;
  height: 16px; /* 固定高度，与文字行高匹配 */
  min-height: 16px; /* 确保即使没有内容也保持高度 */
  display: block; /* 确保高度生效 */
}

.line {
  width: 100%;
  border-bottom: 1px dashed #1a5ee4;
}

/* 为表单项目添加统一的间距，避免验证信息影响整体布局 */
.mine-login-form-item {
  margin-bottom: 16px;
}
</style>
