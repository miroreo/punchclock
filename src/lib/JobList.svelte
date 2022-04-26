<script>
	import { userJobs, getJobEntries, addUserDefaults } from '../db';
	import { getTotalHours } from '../totals';
	import Job from './Job.svelte';
	import Layout from './Layout.svelte';
	import { PunchClockStore } from '../store';
	let val = '';
	let jobs = userJobs();
	addUserDefaults();

	const clickJob = (job) => {
		// console.log(id);
		$PunchClockStore.currentJob = job;
		$PunchClockStore.page = 'job-' + job.id;
		console.log($PunchClockStore);
	};
</script>

<div class="text-base">
	This app is currently limited to <b>single-job</b> mode.
</div>
<div class="flex flex-col my-2 gap-y-3 max-w-md">
	{#each $jobs as job}
		<Job {job} clickEvent={clickJob} />
	{/each}
	<!-- {$PunchClockStore.jobs} -->
	<!-- {JSON.stringify(userData)}
		{userData} -->
</div>
<!-- Clocked in? {userData.clockStatus?.clockedIn} -->
{val}
