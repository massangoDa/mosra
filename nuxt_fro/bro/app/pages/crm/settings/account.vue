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

// 名前変更
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

// アイコン変更
async function submitIcon (e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) {
    toast.error("ファイルを選択してください。");
    return;
  }

  const file = target.files[0];
  const formData = new FormData();
  formData.append("id", userInfo.value?.id || '');
  formData.append("icon", file)
  try {
    const res = await fetchData().fetch(API_ENDPOINTS.accounts.updateIcon, 'PUT', formData);

    await fetchUserInfo();

    toast.success("アイコンが変更されました。");
  } catch (error) {
    console.log(error)
  }
}

watch(userInfo, async (newInfo) => {
  if (newInfo?.name && inputValue.value === '') {
    inputValue.value = newInfo.name;
  }
}, { immediate: true });

</script>

<template>
  <PageContainer title="設定" :sidebar="sidebarLink">
    <h2>アイコン</h2>
    <div class="section">
      <div class="form">
        <img :src="userInfo?.icon" alt="ユーザーアイコン" class="user-icon">
        <div>
          <input type="file" class="fileInputButton" @change="submitIcon" />
        </div>
      </div>
    </div>
    <h2>名前</h2>
    <div class="section">
      <div class="form">
        <input v-model="inputValue" type="text" class="input-name" />
        <div>
          <button
              class="NewInfoButton"
              :disabled="inputValue === userInfo?.name || inputValue.trim() === ''"
              @click="submitName"
          >
            <v-icon name="md-check" />保存
          </button>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.user-icon {
  width: 72px;
  height: 72px;
}

.fileInputButton {
  background-color: transparent;
  border: none;
  cursor: pointer;
}
.fileInputButton::file-selector-button {
  font-weight: bold;
  color: var(--color-text);
  background: var(--color-button-background);
  font-size: 14px;
  border: 0;
  border-radius: 10em;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
}
</style>