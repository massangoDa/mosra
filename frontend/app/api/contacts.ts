import {API_ENDPOINTS} from "~/api/endpoints";
import type {Contacts} from "~/types/types";

export async function fetchContacts(): Promise<Contacts> {
    return await fetchData().fetch(API_ENDPOINTS.contacts.list)
}