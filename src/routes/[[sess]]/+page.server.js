/** @type {import('./$types').PageServerLoad} */

export async function load({ params }) {
    // session
    const { sess } = params;
    // Prerender issue
    // https://kit.svelte.dev/docs/page-options#prerender-when-not-to-prerender
    // const sessionId = url.searchParams.get('session')
    // console.log('server: ', sess)

    return {
		id: sess
	}
}