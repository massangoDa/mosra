<script setup lang="ts">
import {ref} from "vue";
import GridPageContainer from "~/components/PageContainer.vue";
import '~/assets/css/pages/settings.css'
import PageContainer from "~/components/PageContainer.vue";
import {API_ENDPOINTS} from "~/api/endpoints";
import {useToast} from "vue-toastification";
const { userInfo, fetchUserInfo } = useAuth()

const toast = useToast();

const inputValue = ref('')

definePageMeta({
  layout: 'crm-layout',
})

const sidebarLink = [
  {
    name: 'アカウント',
    icon: 'md-accountcircle',
    to: '/crm/settings/account'
  },
  {
    name: 'セキュリティ',
    icon: 'md-lock',
    to: '/crm/settings/security'
  }
]

async function submitName () {
  try {
    const res = await fetchData().fetch(API_ENDPOINTS.accounts.update, 'PUT', {
      id: userInfo.value?.id,
      email: userInfo.value?.email,
      name: inputValue.value,
    })

    await fetchUserInfo()

    toast.success("名前が変更されました。")
  } catch (error) {
    toast.error("名前変更でエラーが発生しました。")
    console.log(error)
  }
}

onMounted(async () => {
  await fetchUserInfo()
  if (userInfo.value?.name) {
    inputValue.value = userInfo.value.name
  }
})

</script>

<template>
  <PageContainer title="設定" :sidebar="sidebarLink">
    <h2>アイコン</h2>
    <div class="section">
      <div class="form">
        <img src="" alt="ユーザーアイコン">
        <div>
          <button class="NewInfoButton">アイコン画像を変更</button>
        </div>
      </div>
    </div>
    <h2>名前</h2>
    <div class="section">
      <div class="form">
        <input v-model="inputValue" type="text" class="input-name" />
        <div v-if="inputValue !== userInfo?.name">
          <button class="NewInfoButton" @click="submitName"><v-icon name="md-check" />保存</button>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>

</style>