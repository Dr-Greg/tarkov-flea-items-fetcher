all:
	deno compile --env-file --allow-env --allow-net --output /usr/local/bin/ mod.ts