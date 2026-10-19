/**
 * Art for each card's window: small line drawings on a 120 × 64 grid, one
 * per concept, so every card in the binder is recognisable on its own.
 * `class="hot"` marks the filled focal shape. Authored here; trusted markup.
 */
export const cardArt: Record<string, string> = {
	'big-o': '<path d="M14 8v46h94"/><path d="M14 52c30-2 58-14 90-42"/><path d="M14 48h90" opacity=".5"/><circle class="hot" cx="104" cy="10" r="4"/>',
	'stack-lifo': '<rect x="40" y="40" width="40" height="10" rx="3"/><rect x="40" y="27" width="40" height="10" rx="3"/><rect class="hot" x="40" y="14" width="40" height="10" rx="3"/><path d="M92 20V6m-5 5 5-5 5 5"/>',
	'queue-fifo': '<path d="M6 32h10m-4-4 4 4-4 4"/><rect x="22" y="22" width="18" height="20" rx="3"/><rect x="46" y="22" width="18" height="20" rx="3"/><rect class="hot" x="70" y="22" width="18" height="20" rx="3"/><path d="M96 32h16m-4-4 4 4-4 4"/>',
	'http-stateless': '<rect x="10" y="18" width="34" height="28" rx="4"/><rect x="76" y="18" width="34" height="28" rx="4"/><path d="M50 32h20" stroke-dasharray="3 5"/><path class="hot" d="M54 24l12 16M66 24 54 40"/>',
	'pure-function': '<path d="M8 32h22m-5-5 5 5-5 5"/><rect class="hot" x="38" y="16" width="44" height="32" rx="8"/><path d="M90 32h22m-5-5 5 5-5 5"/>',
	dns: '<circle cx="28" cy="32" r="16"/><path d="M12 32h32M28 16c-7 8-7 24 0 32M28 16c7 8 7 24 0 32"/><path d="M52 32h18m-4-4 4 4-4 4"/><rect class="hot" x="76" y="24" width="36" height="16" rx="4"/>',
	'http-request': '<rect x="14" y="10" width="92" height="44" rx="6"/><rect class="hot" x="22" y="18" width="22" height="8" rx="2"/><path d="M50 22h48M22 34h70M22 44h52"/>',
	'status-codes': '<rect class="hot" x="10" y="18" width="30" height="28" rx="6"/><rect x="45" y="18" width="30" height="28" rx="6"/><rect x="80" y="18" width="30" height="28" rx="6"/><path d="M18 32h14M53 32h14M88 32h14"/>',
	tls: '<rect x="42" y="28" width="36" height="28" rx="5"/><path d="M50 28v-8a10 10 0 0 1 20 0v8"/><circle class="hot" cx="60" cy="42" r="5"/>',
	'render-pipeline': '<rect x="8" y="24" width="20" height="16" rx="3"/><rect x="36" y="24" width="20" height="16" rx="3"/><rect x="64" y="24" width="20" height="16" rx="3"/><rect class="hot" x="92" y="24" width="20" height="16" rx="3"/><path d="M28 32h8M56 32h8M84 32h8"/>',
	'cache-control': '<circle cx="40" cy="32" r="18"/><path d="M40 20v12l8 6"/><rect class="hot" x="70" y="22" width="36" height="20" rx="4"/>',
	revalidation: '<path d="M30 20a20 20 0 1 1-4 22"/><path d="M22 14v10h10"/><rect class="hot" x="66" y="24" width="44" height="16" rx="8"/>',
	'no-cache': '<rect x="14" y="16" width="36" height="32" rx="5"/><path d="M22 28h20M22 36h14"/><rect x="70" y="16" width="36" height="32" rx="5"/><path class="hot" d="M76 22l24 20M100 22 76 42"/>',
	cdn: '<circle class="hot" cx="60" cy="32" r="8"/><circle cx="18" cy="14" r="6"/><circle cx="102" cy="14" r="6"/><circle cx="18" cy="50" r="6"/><circle cx="102" cy="50" r="6"/><path d="M24 17l29 11M96 17 67 28M24 47l29-11M96 47 67 36"/>',
	'cache-busting': '<rect x="8" y="22" width="44" height="20" rx="4"/><path d="M58 32h8m-4-4 4 4-4 4"/><rect class="hot" x="72" y="22" width="40" height="20" rx="4"/>',
	reference: '<rect x="8" y="12" width="26" height="14" rx="3"/><rect x="8" y="38" width="26" height="14" rx="3"/><path d="M34 19c22 0 22 13 40 13M34 45c22 0 22-13 40-13"/><rect class="hot" x="76" y="20" width="36" height="24" rx="5"/>',
	'primitive-copy': '<rect class="hot" x="14" y="20" width="36" height="24" rx="5"/><rect x="70" y="20" width="36" height="24" rx="5"/><path d="M52 32h16" stroke-dasharray="3 4"/>',
	'shallow-copy': '<rect x="8" y="14" width="32" height="36" rx="5"/><rect x="48" y="14" width="32" height="36" rx="5"/><rect class="hot" x="92" y="22" width="20" height="20" rx="4"/><path d="M30 32h62M70 32h22"/>',
	'reference-equality': '<rect x="10" y="20" width="30" height="24" rx="5"/><rect x="80" y="20" width="30" height="24" rx="5"/><path d="M50 26h20M50 38h20"/><path class="hot" d="M54 20l12 24"/>',
	mutation: '<rect x="12" y="20" width="40" height="24" rx="5"/><path d="M60 32h12m-4-4 4 4-4 4"/><rect x="78" y="20" width="32" height="24" rx="5"/><circle class="hot" cx="102" cy="22" r="6"/>',
	'event-loop': '<path d="M38 18a20 20 0 1 1-6 26"/><path d="M28 12v10h10"/><circle class="hot" cx="60" cy="32" r="5"/><path d="M84 22h26M84 32h26M84 42h18"/>',
	'call-stack': '<rect x="36" y="42" width="48" height="10" rx="3"/><rect x="36" y="29" width="48" height="10" rx="3"/><rect class="hot" x="36" y="16" width="48" height="10" rx="3"/>',
	microtask: '<rect x="10" y="20" width="22" height="24" rx="4"/><rect class="hot" x="38" y="26" width="12" height="12" rx="3"/><rect x="56" y="26" width="12" height="12" rx="3"/><path d="M76 32h34m-5-5 5 5-5 5"/>',
	blocking: '<rect class="hot" x="40" y="10" width="40" height="44" rx="6"/><path d="M8 32h24M88 32h24"/><path d="M28 26l6 6-6 6M92 26l-6 6 6 6"/>',
	'web-apis': '<circle cx="34" cy="32" r="18"/><path d="M34 22v10h8"/><rect class="hot" x="66" y="22" width="44" height="20" rx="10"/>',
	'hash-function': '<rect x="8" y="24" width="30" height="16" rx="3"/><path d="M42 32h10m-4-4 4 4-4 4"/><circle class="hot" cx="68" cy="32" r="10"/><path d="M82 32h10m-4-4 4 4-4 4"/><rect x="96" y="24" width="16" height="16" rx="3"/>',
	'hash-collision': '<rect x="14" y="14" width="18" height="36" rx="3"/><rect x="38" y="14" width="18" height="36" rx="3"/><rect x="62" y="14" width="18" height="36" rx="3"/><rect x="86" y="14" width="18" height="36" rx="3"/><rect class="hot" x="64" y="18" width="14" height="10" rx="2"/><rect class="hot" x="64" y="32" width="14" height="10" rx="2"/>',
	'load-factor': '<rect x="10" y="16" width="44" height="32" rx="4"/><rect class="hot" x="14" y="30" width="36" height="14" rx="2"/><path d="M62 32h10m-4-4 4 4-4 4"/><rect x="78" y="10" width="32" height="44" rx="4"/>',
	set: '<circle cx="46" cy="32" r="22"/><circle class="hot" cx="38" cy="28" r="5"/><circle cx="54" cy="24" r="4"/><circle cx="50" cy="42" r="4"/><path d="M80 24h28M80 40h20"/>',
	'two-pointers': '<path d="M8 40h104"/><path d="M16 40v-6M32 40v-6M48 40v-6M64 40v-6M80 40v-6M96 40v-6"/><path class="hot" d="M16 14v14l-6-6m6 6 6-6M96 14v14l-6-6m6 6 6-6"/>',
	'sorted-precondition': '<rect x="12" y="38" width="12" height="12" rx="2"/><rect x="30" y="32" width="12" height="18" rx="2"/><rect x="48" y="26" width="12" height="24" rx="2"/><rect x="66" y="20" width="12" height="30" rx="2"/><rect class="hot" x="84" y="12" width="12" height="38" rx="2"/>',
	'sliding-window': '<path d="M8 32h104"/><path d="M16 28v8M32 28v8M48 28v8M64 28v8M80 28v8M96 28v8"/><rect class="hot" x="38" y="18" width="36" height="28" rx="6" fill-opacity=".25"/>',
	recursion: '<rect x="10" y="8" width="100" height="48" rx="9"/><rect x="26" y="16" width="68" height="32" rx="7"/><rect x="42" y="24" width="36" height="16" rx="5"/><circle class="hot" cx="60" cy="32" r="4"/>',
	'stack-overflow': '<path d="M34 16v42h52V16" stroke-dasharray="3 4"/><rect x="40" y="46" width="40" height="8" rx="2"/><rect x="40" y="35" width="40" height="8" rx="2"/><rect x="40" y="24" width="40" height="8" rx="2"/><rect x="40" y="13" width="40" height="8" rx="2"/><rect class="hot" x="40" y="3" width="40" height="7" rx="2"/>',
	unwinding: '<path d="M32 8v40m-6-6 6 6 6-6"/><path d="M88 54V14m-6 6 6-6 6 6"/><path d="M38 56h44" opacity=".5"/><circle class="hot" cx="60" cy="54" r="5"/>',
	memoization: '<circle cx="38" cy="12" r="5"/><circle cx="22" cy="34" r="5"/><circle class="hot" cx="54" cy="34" r="5"/><circle cx="12" cy="54" r="4"/><circle cx="32" cy="54" r="4"/><path d="M35 16l-10 14M41 16l10 14M19 38l-5 12M25 38l5 12"/><rect x="74" y="14" width="36" height="36" rx="5"/><path d="M81 26h22M81 34h22M81 42h12"/>',
	peek: '<rect x="30" y="42" width="40" height="10" rx="3"/><rect x="30" y="29" width="40" height="10" rx="3"/><rect class="hot" x="30" y="16" width="40" height="10" rx="3"/><path d="M80 21c7-8 21-8 28 0-7 8-21 8-28 0z"/><circle cx="94" cy="21" r="3"/>',
	'bracket-matching': '<path d="M22 10c-11 11-11 33 0 44"/><path d="M98 10c11 11 11 33 0 44"/><path d="M42 14h-7v36h7"/><path d="M78 14h7v36h-7"/><rect class="hot" x="52" y="24" width="16" height="16" rx="4"/>',
	deque: '<path d="M8 32h14m-4-4 4 4-4 4"/><rect class="hot" x="30" y="22" width="16" height="20" rx="3"/><rect x="52" y="22" width="16" height="20" rx="3"/><rect x="74" y="22" width="16" height="20" rx="3"/><path d="M112 32H98m4-4-4 4 4 4"/>',
	'undo-redo': '<rect x="12" y="42" width="34" height="10" rx="3"/><rect x="12" y="29" width="34" height="10" rx="3"/><rect x="74" y="42" width="34" height="10" rx="3"/><rect class="hot" x="74" y="29" width="34" height="10" rx="3"/><path d="M29 22c2-14 58-14 62 0m-6-4 6 4 4-6"/>',
	'samesite-lax': '<rect x="8" y="16" width="34" height="32" rx="5"/><rect x="78" y="16" width="34" height="32" rx="5"/><path d="M42 24h36m-5-5 5 5-5 5"/><path d="M42 42h36" stroke-dasharray="3 4"/><path class="hot" d="M54 36l12 12M66 36 54 48"/>',
	httponly: '<circle cx="36" cy="32" r="20"/><circle cx="29" cy="25" r="2.5"/><circle cx="43" cy="37" r="2.5"/><circle cx="31" cy="41" r="2"/><rect class="hot" x="72" y="30" width="32" height="22" rx="4"/><path d="M79 30v-6a9 9 0 0 1 18 0v6"/>',
	'host-prefix': '<path d="M12 18h66l18 14-18 14H12z"/><path d="M22 32h40"/><circle class="hot" cx="82" cy="32" r="5"/>',
	'session-fixation': '<circle cx="28" cy="32" r="13"/><circle class="hot" cx="28" cy="32" r="5"/><path d="M41 32h28M61 32v8M69 32v6"/><path d="M96 18a14 14 0 1 1-6 24"/><path d="M84 38l6 4 4-7"/>',
	'same-site': '<circle cx="60" cy="32" r="26"/><rect class="hot" x="38" y="24" width="18" height="16" rx="3"/><rect x="64" y="24" width="18" height="16" rx="3"/>',
	'same-origin-policy': '<rect x="8" y="14" width="40" height="36" rx="6"/><rect x="72" y="14" width="40" height="36" rx="6"/><path d="M48 24h24m-5-5 5 5-5 5"/><path d="M72 42H52" stroke-dasharray="3 4"/><path class="hot" d="M55 33l10 14M65 33 55 47"/>',
	preflight: '<rect x="6" y="18" width="24" height="28" rx="4"/><rect x="90" y="18" width="24" height="28" rx="4"/><path d="M34 24h50m-5-5 5 5-5 5" stroke-dasharray="4 4"/><path d="M34 40h50m-5-5 5 5-5 5"/><circle class="hot" cx="58" cy="24" r="4"/>',
	'cors-credentials': '<path d="M26 20v24M15 26l22 12M37 26 15 38"/><path d="M48 32h10m-4-4 4 4-4 4"/><rect class="hot" x="66" y="18" width="44" height="28" rx="5"/>',
	'preflight-cache': '<circle cx="32" cy="32" r="18"/><path d="M32 22v10l7 5"/><rect x="64" y="14" width="46" height="10" rx="3"/><rect class="hot" x="64" y="28" width="46" height="10" rx="3"/><rect x="64" y="42" width="46" height="8" rx="3" opacity=".5"/>'
};

/** Art for the topic cards on the Learn page, on the same 120 × 64 grid. */
export const trackArt: Record<string, string> = {
	web: '<rect x="8" y="12" width="46" height="40" rx="5"/><path d="M8 22h46"/><path d="M15 32h28M15 40h20"/><path d="M60 32h16m-4-4 4 4-4 4"/><rect class="hot" x="82" y="16" width="30" height="32" rx="4"/><path class="cut" d="M88 26h18M88 34h18M88 42h10"/>',
	programming: '<path d="M26 10c-9 0-9 7-9 13s-4 9-9 9c5 0 9 3 9 9s0 13 9 13"/><path d="M94 10c9 0 9 7 9 13s4 9 9 9c-5 0-9 3-9 9s0 13-9 13"/><rect x="36" y="14" width="48" height="9" rx="3"/><rect x="36" y="27" width="48" height="9" rx="3"/><rect class="hot" x="36" y="40" width="48" height="9" rx="3"/>',
	structures: '<circle class="hot" cx="60" cy="11" r="6"/><circle cx="32" cy="33" r="6"/><circle cx="88" cy="33" r="6"/><circle cx="18" cy="54" r="5"/><circle cx="46" cy="54" r="5"/><circle cx="102" cy="54" r="5"/><path d="M55 15 37 29M65 15l18 14M28 38l-7 11M36 38l7 11M91 38l8 11"/>'
};
