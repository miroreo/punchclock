<script lang="ts">
	export let startDate: Date = new Date(Date.now);
	export let endDate: Date = new Date(Date.now);
	window.yeet = startDate;
	let dateline = "";
	// if (startDate)
	console.log(startDate);
	const pad2 = (unpadded: number): string => {
		if (unpadded < 10) return `0${unpadded}`;
		else if (unpadded >= 100) throw new Error("Trying to pad number that is bigger than 2 digits.");
		else return `${unpadded}`;
		
	}
	let duration = (endDate.getTime() - startDate.getTime())/3600000
</script>
<div class="border-2 border-gray-600 p-2 rounded-lg w-full">
	<div class="flex flex-row">
		<div class="font-semibold flex-grow">{dateline}</div>
		<div class="">{duration} hour{duration == 1 ? "" : "s"}</div>
	</div>
	<div class="flex flex-row w-full text-green-200">
		<div class="gap-x-1 flex flex-grow">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			Start Time
		</div>
		<div class="flex">{pad2(startDate.getHours())}:{pad2(startDate.getMinutes())}</div>
	</div>
	<div class="flex flex-row w-full text-red-200 ">
		<div class="gap-x-1 flex flex-grow">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
			</svg>
			End Time
		</div>
		<div class="flex">{pad2(endDate.getHours())}:{pad2(endDate.getMinutes())}</div>
	</div>
</div>