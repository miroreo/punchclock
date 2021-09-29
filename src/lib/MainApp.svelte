<script>
	import { PunchClockStore } from '../store';
	import JobList from './JobList.svelte';
	import EntryList from './EntryList.svelte';
</script>
{#if $PunchClockStore.page == "jobs"}
	<JobList />
{:else}
	{#if $PunchClockStore.page.startsWith("job-")}
		<EntryList />
	{/if}
{/if}