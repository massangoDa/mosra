import { defineNuxtPlugin } from '#app';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            fullCalendar: {
                Calendar,
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
            },
        }
    };
});