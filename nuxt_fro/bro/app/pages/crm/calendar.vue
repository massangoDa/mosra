<script setup lang="ts">
import {ref} from "vue";
import {API_ENDPOINTS} from "~/api/endpoints";
import {fetchAllInvoices} from "~/api/allInvoices";
import type {Calendar, Invoice} from "~/types/types";
import {fetchCalendarEvents} from "~/api/calendar-events";
import '~/assets/css/pages/calendar.css'
definePageMeta(
    {
        layout: 'crm-layout',
    }
)

const events = ref<Calendar[]>([])

async function loadCalendarEvents() {
  try {
    events.value = await fetchCalendarEvents();
  } catch (error) {
    console.error('Error fetching calendar events:', error);
  }
}

const { $fullCalendar } = useNuxtApp();
const calendar = ref(null);

onMounted(async() => {
  await loadCalendarEvents();

  const calendarEl = calendar.value;
  const calendarInstance = new $fullCalendar.Calendar(calendarEl, {
    plugins: [
        $fullCalendar.dayGridPlugin,
        $fullCalendar.timeGridPlugin,
        $fullCalendar.listPlugin,
    ],
    initialView: 'dayGridMonth',
    events: [
        ...(events.value.map(event => ({
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          allDay: event.allDay,
          backgroundColor: event.color,
          borderColor: event.color,
          url: event.relatedInvoice
              ? `/crm/customer/${event.relatedCustomer}/invoice/${event.relatedInvoice}`
              : '',
        })))
    ],
    headerToolbar: {
      left: 'today',
      center: 'prev title next',
      right: 'dayGridMonth,timeGridDay,listWeek',
    },
    locale: 'ja',
  });
  calendarInstance.render();
})

// カレンダー予定追加機能
const showCalendarAddModal = ref(false);

const submitUrl = computed(() =>
  API_ENDPOINTS.createCalendarEvent()
)

const calendarFields = [
  {
    name: 'title',
    label: 'タイトル',
    type: 'text',
    required: true
  },
  {
    name: 'description',
    label: '説明',
    type: 'textarea'
  },
  {
    name: 'date',
    label: '日付',
    type: 'date',
    required: true
  },
  {
    name: 'startTime',
    label: '開始時間',
    type: 'datetime',
    required: true
  },
  {
    name: 'endTime',
    label: '終了時間',
    type: 'datetime',
    required: true
  },
  {
    name: 'category',
    label: 'カテゴリー',
    type: 'text',
  },
  {
    name: 'color',
    label: '色分け',
    type: 'color',
    required: true
  }
]
</script>

<template>
<div>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1 class="page-title">カレンダー</h1>
      </div>
      <div class="header-right">
        <button @click="showCalendarAddModal = true" class="NewInfoButton">+ 予定を追加</button>
      </div>
    </div>
    <div class="calendar-container">
      <div class="calendar">
        <div ref="calendar"></div>
      </div>
    </div>
  </div>
  <TemplateModal
      v-if="showCalendarAddModal"
      title="予定"
      section-title="予定を追加"
      :submit-url="submitUrl"
      :fields="calendarFields"
      success-message="予定を保存しました"
      @close-modal="showCalendarAddModal = false"
      @refresh=""
  />
</div>
</template>

<style scoped>
:deep(a, .green) {
  text-decoration: none;
  color: var(--color-text);
  transition: 0.4s;
  padding: 3px;
}

/*カレンダー内部を深くまで味わう*/
:deep(.fc-header-toolbar) {
  padding-bottom: 20px;
}
:deep(.fc-toolbar-chunk:nth-child(2)) {
  display: flex;
  align-items: center;
  gap: 16px;
}
:deep(.fc-prev-button),
:deep(.fc-next-button) {
  background-color: transparent;
  color: var(--color-text);
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
:deep(.fc-prev-button:hover),
:deep(.fc-next-button:hover) {
  background-color: var(--color-background);
}
:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}
:deep(.fc-button-group .fc-button) {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

:deep(.fc-day-today) {
  background-color: var(--color-calendar-today-background) !important;
}
:deep(.fc-daygrid-day-number) {
  padding: 8px;
  font-weight: 500;
  color: var(--color-navy);
}
:deep(.fc-day-sat .fc-daygrid-day-number) {
  color: var(--color-blue);
}
:deep(.fc-day-sun .fc-daygrid-day-number) {
  color: var(--color-red);
}

:deep(.fc-event) {
  background-color: var(--color-blue);
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
:deep(.fc-event:hover) {
  background-color: var(--color-blue-hover);
}

:deep(.fc-event-title) {
  color: var(--color-text);
  font-weight: 500;
}

:deep(.fc-event-main) {
  color: var(--color-text);
}

/* daygridイベント専用 */
:deep(.fc-daygrid-event) {
  border-left: 4px solid var(--color-blue);
}

/* 過去のイベント */
:deep(.fc-event-past) {
  background-color: var(--color-gray);
}

/* 今日のイベント */
:deep(.fc-event-today) {
  background-color: var(--color-orange);
}

/* 未来のイベント */
:deep(.fc-event-future) {
  background-color: var(--color-emerald);
}

:root.dark {
  :deep(.fc-toolbar-title) {
    color: var(--color-text);
  }
  :deep(.fc-daygrid-day-number) {
    color: var(--color-gray);
  }
  :deep(.fc-day-sat .fc-daygrid-day-number) {
    color: var(--color-blue);
  }
  :deep(.fc-day-sun .fc-daygrid-day-number) {
    color: var(--color-red);
  }
}
</style>