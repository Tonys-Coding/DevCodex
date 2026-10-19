<script lang="ts">
	/**
	 * One authored icon set shared by all three directions.
	 * 24px grid, 1.5px stroke, round caps and joins.
	 */
	const paths: Record<string, string> = {
		home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
		book: 'M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12.5H7.5A2.5 2.5 0 0 1 5 17zM17 19.5h2.5V7A2.5 2.5 0 0 0 17 4.5',
		map: 'M9 4.5 4 6.5v13l5-2 6 2 5-2v-13l-5 2zM9 4.5v13M15 6.5v13',
		check: 'M5 12.5 9.5 17 19 7',
		'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
		'arrow-right': 'M5 12h14M13 6l6 6-6 6',
		'chevron-left': 'M15 6l-6 6 6 6',
		'chevron-right': 'M9 6l6 6-6 6',
		layers: 'M12 4 3 8.5l9 4.5 9-4.5zM3 12.5 12 17l9-4.5M3 16.5 12 21l9-4.5',
		grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4.5l3 2',
		code: 'M9 7 4 12l5 5M15 7l5 5-5 5',
		stack: 'M4 8h16M4 12h16M4 16h16',
		spark: 'M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z',
		close: 'M6 6l12 12M18 6 6 18',
		swap: 'M4 8h13M14 5l3 3-3 3M20 16H7M10 13l-3 3 3 3',
		info: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 11v5M12 8h.01',
		flag: 'M6 4v16M6 5h11l-2 3.5L17 12H6',
		play: 'M8 5.5v13l10-6.5z',
		pause: 'M8.5 5.5v13M15.5 5.5v13',
		lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z',
		search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20 20',
		refresh: 'M19 8a8 8 0 1 0 1 6M19 4v4h-4',
		flip: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
		route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a3 3 0 0 1 3-3h7M18 9v6a3 3 0 0 1-3 3H8',
		cards: 'M8 4h11v14H8zM5 7v13h11',
		bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6z',
		download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
		upload: 'M12 15V4M7 9l5-5 5 5M5 20h14',
		external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
		flame: 'M12 21a6 6 0 0 0 6-6c0-3.5-2.5-5.5-3.5-8-.6 2-1.8 3-3 3.5.3-2.3-.4-4.6-2.5-6.5C9 7.5 6 10 6 15a6 6 0 0 0 6 6zM12 21a2.5 2.5 0 0 1-2.5-2.5c0-1.8 1.5-2.6 2.5-4 1 1.4 2.5 2.2 2.5 4A2.5 2.5 0 0 1 12 21z',
		trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M9.5 17h5v3h-5z',
		target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
		pencil: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4',
		command: 'M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h-6m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9z'
	};

	let { name, size = 20, stroke = 1.5 }: { name: keyof typeof paths | string; size?: number; stroke?: number } =
		$props();

	const d = $derived(paths[name] ?? paths.info);
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<path {d} />
</svg>
