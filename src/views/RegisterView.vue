<template>
  <div class="min-h-screen flex flex-col bg-[#0F172A] overflow-y-auto">
    <!-- 顶部导航栏 -->
    <header class="fixed top-0 w-full z-10 bg-[#0F172A]/95 backdrop-blur-md border-b border-gray-800">
      <div class="max-w-[375px] mx-auto">
        <div class="flex items-center px-4 py-3">
          <button @click="router.push('/')" class="mr-2">
            <i class="ri-arrow-left-line ri-lg"></i>
          </button>
          <h1 class="text-lg font-semibold">注册</h1>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-1 pt-16 pb-16">
      <div class="max-w-[375px] mx-auto px-4">
        <h1 class="text-2xl font-bold text-center mb-8">注册</h1>
        
        <!-- 一般性错误提示 -->
        <div v-if="generalError" class="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {{ generalError }}
        </div>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">邮箱</label>
            <input
              type="email"
              v-model="formData.email"
              @input="handleEmailChange"
              required
              ref="emailInput"
              :class="[
                'w-full px-4 py-2 rounded-lg bg-gray-800 border focus:ring-1 outline-none', 
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-primary focus:ring-primary'
              ]"
              placeholder="请输入邮箱"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">密码</label>
            <input
              type="password"
              v-model="formData.password"
              @input="handlePasswordChange"
              required
              ref="passwordInput"
              :class="[
                'w-full px-4 py-2 rounded-lg bg-gray-800 border focus:ring-1 outline-none', 
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-primary focus:ring-primary'
              ]"
              placeholder="请输入密码"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
          </div>

          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-400 mb-1">验证码</label>
              <input
                type="text"
                v-model="formData.code"
                @input="handleCodeChange"
                required
                ref="codeInput"
                :class="[
                  'w-full px-4 py-2 rounded-lg bg-gray-800 border focus:ring-1 outline-none', 
                  errors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-primary focus:ring-primary'
                ]"
                placeholder="请输入验证码"
              />
              <p v-if="errors.code" class="mt-1 text-sm text-red-500">{{ errors.code }}</p>
            </div>
            <button
              type="button"
              @click="handleSendCode"
              :disabled="isSendingCode || countdown > 0"
              class="mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ countdown > 0 ? `${countdown}s后重试` : (isSendingCode ? '发送中...' : '获取验证码') }}
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">邀请码</label>
            <input
              type="text"
              v-model="formData.invitation_code"
              required
              ref="invitationCodeInput"
              :class="[
                'w-full px-4 py-2 rounded-lg bg-gray-800 border focus:ring-1 outline-none', 
                errors.invitation_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-primary focus:ring-primary'
              ]"
              placeholder="请输入邀请码"
            />
            <p v-if="errors.invitation_code" class="mt-1 text-sm text-red-500">{{ errors.invitation_code }}</p>
          </div>
          
          <button
            type="submit"
            class="w-full py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg font-medium"
            :disabled="loading"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <router-link to="/login" class="text-primary hover:underline">
            已有账号？立即登录
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/api'

const router = useRouter()
const formData = ref({
  email: '',
  password: '',
  code: '',
  invitation_code: ''
})
const loading = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)

// 添加错误提示相关状态
const errors = ref({
  email: '',
  password: '',
  code: '',
  invitation_code: ''
})
const generalError = ref('')

// 添加输入框的引用，方便定位错误
const emailInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const codeInput = ref<HTMLInputElement | null>(null)
const invitationCodeInput = ref<HTMLInputElement | null>(null)

// 清除错误信息
const clearErrors = () => {
  errors.value = {
    email: '',
    password: '',
    code: '',
    invitation_code: ''
  }
  generalError.value = ''
}

// 对错误字段进行聚焦
const focusErrorField = (field: 'email' | 'password' | 'code' | 'invitation_code') => {
  const inputRefs = {
    email: emailInput,
    password: passwordInput,
    code: codeInput,
    invitation_code: invitationCodeInput
  }
  
  const targetInput = inputRefs[field]
  if (targetInput.value) {
    setTimeout(() => {
      targetInput.value?.focus()
    }, 100)
  }
}

// 保存表单数据到 localStorage
const saveFormData = () => {
  localStorage.setItem('registerFormData', JSON.stringify({
    email: formData.value.email,
    password: formData.value.password,
    code: formData.value.code
  }))
}

// 从 localStorage 恢复表单数据
const restoreFormData = () => {
  const savedData = localStorage.getItem('registerFormData')
  if (savedData) {
    const { email, password, code } = JSON.parse(savedData)
    formData.value.email = email
    formData.value.password = password
    formData.value.code = code
  }
}

// 监听输入变化时清除对应字段的错误提示
const handleEmailChange = () => {
  errors.value.email = ''
  generalError.value = ''
  saveFormData()
}

const handlePasswordChange = () => {
  errors.value.password = ''
  generalError.value = ''
  saveFormData()
}

const handleCodeChange = () => {
  errors.value.code = ''
  generalError.value = ''
  saveFormData()
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendCode = async () => {
  clearErrors()
  
  if (!formData.value.email) {
    errors.value.email = '请输入邮箱'
    focusErrorField('email')
    return
  }

  isSendingCode.value = true
  try {
    await auth.sendCode({ email: formData.value.email })
    startCountdown()
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    if (error.response?.data?.message?.email) {
      errors.value.email = error.response.data.message.email[0] || '邮箱格式错误'
      focusErrorField('email')
    } else if (error.response?.data?.message) {
      generalError.value = typeof error.response.data.message === 'string' 
        ? error.response.data.message 
        : '发送验证码失败，请稍后重试'
    } else {
      generalError.value = '发送验证码失败，请稍后重试'
    }
  } finally {
    isSendingCode.value = false
  }
}

const handleRegister = async () => {
  clearErrors()
  
  // 表单验证
  let hasError = false
  
  if (!formData.value.email) {
    errors.value.email = '请输入邮箱'
    if (!hasError) {
      focusErrorField('email')
      hasError = true
    }
  }
  
  if (!formData.value.password) {
    errors.value.password = '请输入密码'
    if (!hasError) {
      focusErrorField('password')
      hasError = true
    }
  }
  
  if (!formData.value.code) {
    errors.value.code = '请输入验证码'
    if (!hasError) {
      focusErrorField('code')
      hasError = true
    }
  }
  
  if (!formData.value.invitation_code) {
    errors.value.invitation_code = '请输入邀请码'
    if (!hasError) {
      focusErrorField('invitation_code')
      hasError = true
    }
  }
  
  if (hasError) return
  
  loading.value = true
  try {
    const requestData = {
      email: formData.value.email.trim(),
      password: formData.value.password.trim(),
      code: formData.value.code.trim(),
      invitation_code: formData.value.invitation_code.trim()
    }
    console.log('Sending registration request with data:', requestData)
    
    const response = await auth.register(requestData)
    console.log('Registration response:', response)
    
    // 注册成功后清除保存的表单数据
    localStorage.removeItem('registerFormData')
    // 直接跳转到登录页面
    router.push('/login')
  } catch (error: any) {
    console.error('Registration failed:', error)
    if (error.response?.data?.message) {
      const errorData = error.response.data.message
      
      // 处理各种字段的错误
      if (typeof errorData === 'object') {
        // 映射后端错误字段到前端表单字段
        const fieldMap: Record<string, keyof typeof errors.value> = {
          email: 'email',
          password: 'password',
          code: 'code',
          invitation_code: 'invitation_code'
        }
        
        let focusedFirst = false
        
        // 遍历错误字段并设置对应错误信息
        Object.entries(errorData).forEach(([field, message]) => {
          const formField = fieldMap[field]
          if (formField) {
            errors.value[formField] = Array.isArray(message) ? message[0] : message as string
            
            // 只聚焦第一个错误字段
            if (!focusedFirst) {
              focusErrorField(formField)
              focusedFirst = true
            }
          } else {
            // 不是表单字段的错误信息，放到通用错误中
            generalError.value = Array.isArray(message) ? message[0] : message as string
          }
        })
      } else if (typeof errorData === 'string') {
        generalError.value = errorData
      }
    } else {
      generalError.value = '注册失败，请检查输入信息'
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时恢复表单数据
onMounted(() => {
  restoreFormData()
})
</script> 