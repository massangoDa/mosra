import type {Calendar} from "~/types/types";
import {API_ENDPOINTS} from "~/api/endpoints";

export async function fetchCalendarEvents(): Promise<Calendar> {
    return await fetchData().fetch(API_ENDPOINTS.calendarEvents())
}