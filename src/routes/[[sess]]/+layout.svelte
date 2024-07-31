<script>
    import "../../tailwind.css"
    import '../../app.css'
    import {showLogin, mobile, showSidebar} from '$lib/store.js'
    import {BREAKPOINT} from '$lib/constants.js'
	import LoginView from "$lib/components/LoginView.svelte";
	import { onMount } from "svelte";

    onMount(() => {
        mobile.set(window.innerWidth < BREAKPOINT);
		const onResize = () => {
			if (window.innerWidth < BREAKPOINT) {
				mobile.set(true);
			} else {
				mobile.set(false);
			}
		};

		window.addEventListener('resize', onResize);
    })
</script>

{#if $showLogin}
    <LoginView/>
{:else}
    <div class="app relative">
        <div class="text-stone-900 bg-stone-200 dark:text-gray-100 dark:bg-gray-900 min-h-screen overflow-auto scrollbar flex flex-row">
            <slot />
        </div>
    </div>
{/if}
