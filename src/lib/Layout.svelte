<script>
	import ClockIn from './ClockIn.svelte';
	export let logout;
	export let user;
</script>
<div class="bg-gray-900 min-h-screen min-w-full text-white p-5 flex flex-col">
  <div class="flex flex-row my-5 place-items-center">
    <div class="sm:text-3xl text-2xl font-bold flex-grow" as="h1">Time Tracker</div>
    <div class="border-solid border-2 p-3 rounded-lg border-green-500 text-green-300 flex flex-row gap-x-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
				<ClockIn />
    </div>
  </div>
	<slot></slot>
	<div class="flex flex-row bottom place-items-center">
    <div class="flex flex-row flex-grow gap-x-2 text-lg place-items-center">
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
      <!-- {user.email} -->
    </div>
    <button on:click={logout} class="border-2 border-blue-400 px-2 py-1 rounded-lg">Sign Out</button>
  </div>
</div>