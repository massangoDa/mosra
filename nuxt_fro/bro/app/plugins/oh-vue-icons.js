import { OhVueIcon, addIcons } from 'oh-vue-icons';
import {
    FaSpotify,
    FaGithub,
    FaPencilAlt,
    HiHome,
    HiPencilAlt,
    BiInfoCircle,
    BiSearch,
    BiCalendarEvent,
    BiPcDisplay,
    MdDashboard,
    MdMessage,
    MdAnalytics,
    MdInfo,
    MdHandshake,
    MdLogout,
    LaEditSolid,
} from 'oh-vue-icons/icons';

addIcons(FaSpotify, FaGithub, FaPencilAlt, HiHome, HiPencilAlt, BiInfoCircle, BiSearch, BiCalendarEvent, BiPcDisplay, MdDashboard, MdMessage, MdAnalytics, MdInfo, MdHandshake, MdLogout, LaEditSolid);

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('v-icon', OhVueIcon);
});