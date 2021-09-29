<script>
	import { userJob } from '../db';
	import Entry from './Entry.svelte';
	import Layout from './Layout.svelte';
	import { PunchClockStore } from '../store';
	let job = userJob($PunchClockStore.currentJob.id);
</script>
<div class="text-base">
	This app is currently limited to <b>single-job</b> mode.
</div>
<div class="flex flex-col my-2 gap-y-3 max-w-md flex-grow">
	{#if $job?.entries}
	{#each $job.entries as entry}
	<Entry startDate={entry.startTime} endDate={entry.endTime} />
	{JSON.stringify(entry)}
	{/each}
	{/if}
	<!-- {$PunchClockStore.jobs} -->
	<!-- {JSON.stringify(userData)}
	{userData} -->
</div>
<!-- Clocked in? {userData.clockStatus?.clockedIn} -->