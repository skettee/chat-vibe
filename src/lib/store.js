import { writable } from 'svelte/store';

// Modal
export const showLogin = writable(false)

// Sidebar
export const mobile = writable(false)
export const showSidebar = writable(true)

// Chat Info
export const user = writable({
    name: "User",
    char: "default"

})
// export const char = writable({code: null})
export const session = writable({
    id: null,
    char: null
})
export const chat = writable({id: null})
