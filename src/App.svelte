<script lang="ts">
	import { Router, Route, Link } from "svelte-navigator";
	import MainApp from './lib/MainApp.svelte';
  import AuthGuard from './lib/AuthGuard.svelte';	
	import Login from './lib/Login.svelte';
	import Layout from './lib/Layout.svelte';
	import "./app.postcss";
	
</script>

	<AuthGuard
    useRedirect={false}
    let:user
    let:loggedIn
    let:loginWithGithub
    let:logout
  >
		
			{#if loggedIn}
			<Layout loggedIn={loggedIn} logout={logout} user={user}>
				<MainApp />
			</Layout>
			{:else}
				<Login loginWithGithub={loginWithGithub} overrideFirebase/>
			{/if}
		
  </AuthGuard>