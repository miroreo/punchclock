<script context="module">
	// export const load = async ({ fetch }) => {
	// 	const res = await fetch('/api/jobs', {
	// 		method: 'GET',
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		}
	// 	});
	// 	let data = await res.json();
	// 	if(res.status != 200) return data.error;
	// 	return {
	// 		props: {
	// 			data: JSON.parse(data),
	// 			loggedIn: JSON.parse(data)
	// 		}
	// 	};
	// };
</script>

<script lang="ts">
	import { GlobalStore } from '../store';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>{$GlobalStore.data}</h1>
</section>
