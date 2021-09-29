<script>
	export let job;
	export let clickEvent;
	import {getJobEntries} from '../db';
	import { getTotalHours } from '../totals';
	let name = job.name;
	let totalHours = 0;
	getJobEntries(job.id).then(e => {
		console.log(e);
		totalHours = getTotalHours(e)
	});
	const handleClick = () => {
		clickEvent(job);
	}
</script>
<div role="button" on:click|preventDefault={handleClick} data-jobid={job.id} class="border-2 border-gray-600 rounded-lg p-5 w-full flex flex-col">
	<div class="font-semibold text-2xl">{name}</div>
	<div class="flex flex-row">
		<div class="font-semibold flex-grow">Total Time: </div>
		<div class="">{totalHours} hours</div>
	</div>
</div>