{ pkgs }: {
	deps = with pkgs; [
		nodejs-16_x
		nodePackages.vercel
		nodePackages.typescript-language-server
		nodePackages.svelte-language-server
	];
}