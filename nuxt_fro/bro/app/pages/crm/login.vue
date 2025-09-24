<script setup lang="ts">
import {useAuth} from "~/composables/useAuth";

definePageMeta({
  layout: 'login',
})

// データ
const email = ref('')
const password = ref('')
const isLoading = ref(false)

// フォーム送信処理
const handleSubmit = async () => {
  if (!email.value || !password.value) {
    alert("メールアドレスとパスワードを入力してください")
    return
  }

  isLoading.value = true

  try {
    // useAuthの読み込み
    const { login } = useAuth()
    await login(email.value, password.value)

    await navigateTo('/crm/dashboard')
  } catch (error) {
    alert("ログインに失敗しました")
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="inf-container">
    <div class="inf-left">
      <h1>Login</h1>
    </div>
    <div class="inf-right">
      <h2>Sign In to MassCRM</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" v-model="email" placeholder="youremail@gmail.com" required :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="••••••••" required :disabled="isLoading" />
        </div>
        <button type="submit" class="sign-in-btn" :disabled="isLoading">{{ isLoading ? "サインイン中..." : "Sign In" }}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.inf-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.inf-left {
  flex: 1;
  background-color: #3f8cff;
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.inf-left h1 {
  font-size: 2.5em;
  margin: 0;
}

.inf-left p {
  font-size: 1.2em;
  text-align: center;
}

.illustration img {
  max-width: 100%;
  height: auto;
}

.inf-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #fff;
}

.inf-right h2 {
  font-size: 1.5em;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #7d8592;
}

.form-group input {
  width: 100%;
  padding: 14px;
  border: 1px solid #ced4da;
  border-radius: 12px;
  font-size: 1em;
}

.form-options a {
  color: #007BFF;
  text-decoration: none;
}

.form-options a:hover {
  text-decoration: underline;
}

.sign-in-btn {
  width: 50%;
  padding: 10px;
  background-color: #3f8cff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1em;
  cursor: pointer;
  margin: 0 auto;
  display: block;
  transition: background-color 0.3s ease;
}

.sign-in-btn:hover {
  background-color: #0056b3;
}

.signup-link a {
  color: #007BFF;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>