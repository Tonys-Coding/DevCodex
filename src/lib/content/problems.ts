import type { Problem } from './types';

/*
 * Practice problems, written in our own words. Each links to the well-known
 * original. Positions are 0-based everywhere for consistency.
 */

const py = (sig: string, note: string) => `${sig}\n    # ${note}\n    pass\n`;
const js = (sig: string, note: string) => `${sig} {\n  // ${note}\n}\n`;

export const problems: Problem[] = [
	{
		id: 'pair-sum',
		title: 'Pair that hits the target',
		pattern: 'Arrays & Hashing',
		difficulty: 'Easy',
		statement:
			'Given a list of whole numbers and a target, return the positions of the two numbers that add up to the target, smaller position first. Exactly one pair works, and you may not use the same position twice.',
		examples: [
			{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
			{ input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }
		],
		hint: 'For each number, the partner you need is target − number. Remember what you have already seen, and where.',
		compare: 'exact',
		fn: { python: 'pair_sum', javascript: 'pairSum' },
		starter: {
			python: py('def pair_sum(nums: list[int], target: int) -> list[int]:', 'Return the two positions, smaller first.'),
			javascript: js('function pairSum(nums, target)', 'Return the two positions, smaller first.')
		},
		solution: {
			python:
				'def pair_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i]\n        seen[n] = i\n    return []\n',
			javascript:
				'function pairSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n'
		},
		tests: [
			{ args: [[2, 7, 11, 15], 9], expected: [0, 1] },
			{ args: [[3, 2, 4], 6], expected: [1, 2] },
			{ args: [[3, 3], 6], expected: [0, 1] },
			{ args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
			{ args: [[0, 4, 3, 0], 0], expected: [0, 3] }
		],
		external: { label: 'Two Sum on LeetCode', url: 'https://leetcode.com/problems/two-sum/' }
	},
	{
		id: 'has-duplicate',
		title: 'Any repeats?',
		pattern: 'Arrays & Hashing',
		difficulty: 'Easy',
		statement: 'Return true if any value appears at least twice in the list, and false if every value is different.',
		examples: [
			{ input: 'nums = [1, 2, 3, 1]', output: 'true' },
			{ input: 'nums = [1, 2, 3, 4]', output: 'false' }
		],
		hint: 'A set answers “have I seen this before?” in constant time.',
		compare: 'exact',
		fn: { python: 'has_duplicate', javascript: 'hasDuplicate' },
		starter: {
			python: py('def has_duplicate(nums: list[int]) -> bool:', 'Return True if any value repeats.'),
			javascript: js('function hasDuplicate(nums)', 'Return true if any value repeats.')
		},
		solution: {
			python: 'def has_duplicate(nums: list[int]) -> bool:\n    seen = set()\n    for n in nums:\n        if n in seen:\n            return True\n        seen.add(n)\n    return False\n',
			javascript: 'function hasDuplicate(nums) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(n)) return true;\n    seen.add(n);\n  }\n  return false;\n}\n'
		},
		tests: [
			{ args: [[1, 2, 3, 1]], expected: true },
			{ args: [[1, 2, 3, 4]], expected: false },
			{ args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
			{ args: [[]], expected: false }
		],
		external: { label: 'Contains Duplicate on LeetCode', url: 'https://leetcode.com/problems/contains-duplicate/' }
	},
	{
		id: 'is-anagram',
		title: 'Same letters, new word',
		pattern: 'Arrays & Hashing',
		difficulty: 'Easy',
		statement: 'Given two lowercase strings, return true if the second uses exactly the same letters as the first, each the same number of times.',
		examples: [
			{ input: 's = "anagram", t = "nagaram"', output: 'true' },
			{ input: 's = "rat", t = "car"', output: 'false' }
		],
		hint: 'Count each letter in one word, then subtract the counts of the other. Everything should end at zero.',
		compare: 'exact',
		fn: { python: 'is_anagram', javascript: 'isAnagram' },
		starter: {
			python: py('def is_anagram(s: str, t: str) -> bool:', 'Return True if t rearranges the letters of s.'),
			javascript: js('function isAnagram(s, t)', 'Return true if t rearranges the letters of s.')
		},
		solution: {
			python:
				'def is_anagram(s: str, t: str) -> bool:\n    if len(s) != len(t):\n        return False\n    counts = {}\n    for a, b in zip(s, t):\n        counts[a] = counts.get(a, 0) + 1\n        counts[b] = counts.get(b, 0) - 1\n    return all(v == 0 for v in counts.values())\n',
			javascript:
				'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const counts = new Map();\n  for (let i = 0; i < s.length; i++) {\n    counts.set(s[i], (counts.get(s[i]) ?? 0) + 1);\n    counts.set(t[i], (counts.get(t[i]) ?? 0) - 1);\n  }\n  return [...counts.values()].every((v) => v === 0);\n}\n'
		},
		tests: [
			{ args: ['anagram', 'nagaram'], expected: true },
			{ args: ['rat', 'car'], expected: false },
			{ args: ['a', 'ab'], expected: false },
			{ args: ['listen', 'silent'], expected: true }
		],
		external: { label: 'Valid Anagram on LeetCode', url: 'https://leetcode.com/problems/valid-anagram/' }
	},
	{
		id: 'group-anagrams',
		title: 'Group the anagrams',
		pattern: 'Arrays & Hashing',
		difficulty: 'Medium',
		statement: 'Given a list of lowercase words, group together the words that are anagrams of each other. Groups and the words inside them may be in any order.',
		examples: [{ input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]' }],
		hint: 'Anagrams share a signature: their letters sorted. Use it as a map key.',
		compare: 'unordered-deep',
		fn: { python: 'group_anagrams', javascript: 'groupAnagrams' },
		starter: {
			python: py('def group_anagrams(words: list[str]) -> list[list[str]]:', 'Return a list of groups.'),
			javascript: js('function groupAnagrams(words)', 'Return an array of groups.')
		},
		solution: {
			python:
				'def group_anagrams(words: list[str]) -> list[list[str]]:\n    groups = {}\n    for w in words:\n        groups.setdefault("".join(sorted(w)), []).append(w)\n    return list(groups.values())\n',
			javascript:
				'function groupAnagrams(words) {\n  const groups = new Map();\n  for (const w of words) {\n    const key = [...w].sort().join("");\n    if (!groups.has(key)) groups.set(key, []);\n    groups.get(key).push(w);\n  }\n  return [...groups.values()];\n}\n'
		},
		tests: [
			{ args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
			{ args: [['']], expected: [['']] },
			{ args: [['a']], expected: [['a']] },
			{ args: [['ab', 'ba', 'abc', 'cab', 'x']], expected: [['ab', 'ba'], ['abc', 'cab'], ['x']] }
		],
		external: { label: 'Group Anagrams on LeetCode', url: 'https://leetcode.com/problems/group-anagrams/' }
	},
	{
		id: 'top-k-frequent',
		title: 'The k most common',
		pattern: 'Arrays & Hashing',
		difficulty: 'Medium',
		statement: 'Return the k values that appear most often in the list. The answer is unique, and it may be in any order.',
		examples: [
			{ input: 'nums = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' },
			{ input: 'nums = [1], k = 1', output: '[1]' }
		],
		hint: 'Count with a map. Then, instead of sorting, put each value in a bucket indexed by its count.',
		compare: 'unordered',
		fn: { python: 'top_k_frequent', javascript: 'topKFrequent' },
		starter: {
			python: py('def top_k_frequent(nums: list[int], k: int) -> list[int]:', 'Return the k most frequent values.'),
			javascript: js('function topKFrequent(nums, k)', 'Return the k most frequent values.')
		},
		solution: {
			python:
				'def top_k_frequent(nums: list[int], k: int) -> list[int]:\n    counts = {}\n    for n in nums:\n        counts[n] = counts.get(n, 0) + 1\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for n, c in counts.items():\n        buckets[c].append(n)\n    out = []\n    for c in range(len(buckets) - 1, 0, -1):\n        for n in buckets[c]:\n            out.append(n)\n            if len(out) == k:\n                return out\n    return out\n',
			javascript:
				'function topKFrequent(nums, k) {\n  const counts = new Map();\n  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);\n  const buckets = Array.from({ length: nums.length + 1 }, () => []);\n  for (const [n, c] of counts) buckets[c].push(n);\n  const out = [];\n  for (let c = buckets.length - 1; c > 0; c--) {\n    for (const n of buckets[c]) {\n      out.push(n);\n      if (out.length === k) return out;\n    }\n  }\n  return out;\n}\n'
		},
		tests: [
			{ args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
			{ args: [[1], 1], expected: [1] },
			{ args: [[4, 4, 5, 5, 5, 6], 1], expected: [5] },
			{ args: [[7, 7, 8, 8, 9, 9, 9, 1], 3], expected: [7, 8, 9] }
		],
		external: { label: 'Top K Frequent Elements on LeetCode', url: 'https://leetcode.com/problems/top-k-frequent-elements/' }
	},
	{
		id: 'is-palindrome',
		title: 'Reads the same both ways',
		pattern: 'Two Pointers',
		difficulty: 'Easy',
		statement: 'Ignoring case and anything that is not a letter or digit, return true if the text reads the same forwards and backwards.',
		examples: [
			{ input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
			{ input: 's = "race a car"', output: 'false' }
		],
		hint: 'Start a pointer at each end. Skip anything that is not a letter or digit, compare, then step both inward.',
		compare: 'exact',
		fn: { python: 'is_palindrome', javascript: 'isPalindrome' },
		starter: {
			python: py('def is_palindrome(s: str) -> bool:', 'Compare letters and digits only, ignoring case.'),
			javascript: js('function isPalindrome(s)', 'Compare letters and digits only, ignoring case.')
		},
		solution: {
			python:
				'def is_palindrome(s: str) -> bool:\n    i, j = 0, len(s) - 1\n    while i < j:\n        if not s[i].isalnum():\n            i += 1\n        elif not s[j].isalnum():\n            j -= 1\n        elif s[i].lower() != s[j].lower():\n            return False\n        else:\n            i += 1\n            j -= 1\n    return True\n',
			javascript:
				'function isPalindrome(s) {\n  const ok = (c) => /[a-z0-9]/i.test(c);\n  let i = 0;\n  let j = s.length - 1;\n  while (i < j) {\n    if (!ok(s[i])) i++;\n    else if (!ok(s[j])) j--;\n    else if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;\n    else {\n      i++;\n      j--;\n    }\n  }\n  return true;\n}\n'
		},
		tests: [
			{ args: ['A man, a plan, a canal: Panama'], expected: true },
			{ args: ['race a car'], expected: false },
			{ args: [' '], expected: true },
			{ args: ["No 'x' in Nixon"], expected: true },
			{ args: ['0P'], expected: false }
		],
		external: { label: 'Valid Palindrome on LeetCode', url: 'https://leetcode.com/problems/valid-palindrome/' }
	},
	{
		id: 'sorted-pair-sum',
		title: 'Pair sum in a sorted list',
		pattern: 'Two Pointers',
		difficulty: 'Medium',
		statement:
			'The list is sorted from smallest to largest. Return the 0-based positions of the two numbers that add up to the target, smaller first. Exactly one pair works. Aim for constant extra space.',
		examples: [
			{ input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
			{ input: 'nums = [2, 3, 4], target = 6', output: '[0, 2]' }
		],
		hint: 'Put one pointer at each end. If the sum is too small, the left number must grow; if too big, the right number must shrink.',
		compare: 'exact',
		fn: { python: 'sorted_pair_sum', javascript: 'sortedPairSum' },
		starter: {
			python: py('def sorted_pair_sum(nums: list[int], target: int) -> list[int]:', 'Two pointers, one at each end.'),
			javascript: js('function sortedPairSum(nums, target)', 'Two pointers, one at each end.')
		},
		solution: {
			python:
				'def sorted_pair_sum(nums: list[int], target: int) -> list[int]:\n    i, j = 0, len(nums) - 1\n    while i < j:\n        total = nums[i] + nums[j]\n        if total == target:\n            return [i, j]\n        if total < target:\n            i += 1\n        else:\n            j -= 1\n    return []\n',
			javascript:
				'function sortedPairSum(nums, target) {\n  let i = 0;\n  let j = nums.length - 1;\n  while (i < j) {\n    const total = nums[i] + nums[j];\n    if (total === target) return [i, j];\n    if (total < target) i++;\n    else j--;\n  }\n  return [];\n}\n'
		},
		tests: [
			{ args: [[2, 7, 11, 15], 9], expected: [0, 1] },
			{ args: [[2, 3, 4], 6], expected: [0, 2] },
			{ args: [[-1, 0], -1], expected: [0, 1] },
			{ args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [3, 4] }
		],
		external: { label: 'Two Sum II on LeetCode', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' }
	},
	{
		id: 'most-water',
		title: 'The biggest tank',
		pattern: 'Two Pointers',
		difficulty: 'Medium',
		statement:
			'Each number is the height of a vertical wall, one unit apart. Pick two walls; the water they hold is the distance between them times the shorter wall. Return the most water any pair can hold.',
		examples: [{ input: 'heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]', output: '49', note: 'Walls at positions 1 and 8: 7 × min(8, 7).' }],
		hint: 'Start with the widest pair. Moving the taller wall inward can never help, so always move the shorter one.',
		compare: 'exact',
		fn: { python: 'most_water', javascript: 'mostWater' },
		starter: {
			python: py('def most_water(heights: list[int]) -> int:', 'Return the largest area.'),
			javascript: js('function mostWater(heights)', 'Return the largest area.')
		},
		solution: {
			python:
				'def most_water(heights: list[int]) -> int:\n    i, j, best = 0, len(heights) - 1, 0\n    while i < j:\n        best = max(best, (j - i) * min(heights[i], heights[j]))\n        if heights[i] < heights[j]:\n            i += 1\n        else:\n            j -= 1\n    return best\n',
			javascript:
				'function mostWater(heights) {\n  let i = 0;\n  let j = heights.length - 1;\n  let best = 0;\n  while (i < j) {\n    best = Math.max(best, (j - i) * Math.min(heights[i], heights[j]));\n    if (heights[i] < heights[j]) i++;\n    else j--;\n  }\n  return best;\n}\n'
		},
		tests: [
			{ args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
			{ args: [[1, 1]], expected: 1 },
			{ args: [[4, 3, 2, 1, 4]], expected: 16 },
			{ args: [[1, 2, 1]], expected: 2 }
		],
		external: { label: 'Container With Most Water on LeetCode', url: 'https://leetcode.com/problems/container-with-most-water/' }
	},
	{
		id: 'best-profit',
		title: 'Buy low, sell later',
		pattern: 'Sliding Window',
		difficulty: 'Easy',
		statement: 'Each number is a stock price on one day. Buy on one day and sell on a later day. Return the largest possible profit, or 0 if no trade makes money.',
		examples: [
			{ input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', note: 'Buy at 1, sell at 6.' },
			{ input: 'prices = [7, 6, 4, 3, 1]', output: '0' }
		],
		hint: 'Walk the days once. Keep the cheapest price so far, and compare today’s price against it.',
		compare: 'exact',
		fn: { python: 'best_profit', javascript: 'bestProfit' },
		starter: {
			python: py('def best_profit(prices: list[int]) -> int:', 'Return the best profit, or 0.'),
			javascript: js('function bestProfit(prices)', 'Return the best profit, or 0.')
		},
		solution: {
			python:
				'def best_profit(prices: list[int]) -> int:\n    low, best = float("inf"), 0\n    for p in prices:\n        low = min(low, p)\n        best = max(best, p - low)\n    return best\n',
			javascript:
				'function bestProfit(prices) {\n  let low = Infinity;\n  let best = 0;\n  for (const p of prices) {\n    low = Math.min(low, p);\n    best = Math.max(best, p - low);\n  }\n  return best;\n}\n'
		},
		tests: [
			{ args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
			{ args: [[7, 6, 4, 3, 1]], expected: 0 },
			{ args: [[2, 4, 1]], expected: 2 },
			{ args: [[3, 2, 6, 5, 0, 3]], expected: 4 }
		],
		external: { label: 'Best Time to Buy and Sell Stock on LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' }
	},
	{
		id: 'longest-unique',
		title: 'Longest run without repeats',
		pattern: 'Sliding Window',
		difficulty: 'Medium',
		statement: 'Return the length of the longest stretch of consecutive characters in the string where no character appears twice.',
		examples: [
			{ input: 's = "abcabcbb"', output: '3', note: '"abc"' },
			{ input: 's = "pwwkew"', output: '3', note: '"wke"' }
		],
		hint: 'Grow a window to the right. When a character repeats, move the left edge just past its previous position.',
		compare: 'exact',
		fn: { python: 'longest_unique', javascript: 'longestUnique' },
		starter: {
			python: py('def longest_unique(s: str) -> int:', 'Return the length of the longest repeat-free stretch.'),
			javascript: js('function longestUnique(s)', 'Return the length of the longest repeat-free stretch.')
		},
		solution: {
			python:
				'def longest_unique(s: str) -> int:\n    last, left, best = {}, 0, 0\n    for right, c in enumerate(s):\n        if c in last and last[c] >= left:\n            left = last[c] + 1\n        last[c] = right\n        best = max(best, right - left + 1)\n    return best\n',
			javascript:
				'function longestUnique(s) {\n  const last = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    if (last.has(c) && last.get(c) >= left) left = last.get(c) + 1;\n    last.set(c, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}\n'
		},
		tests: [
			{ args: ['abcabcbb'], expected: 3 },
			{ args: ['bbbbb'], expected: 1 },
			{ args: ['pwwkew'], expected: 3 },
			{ args: [''], expected: 0 },
			{ args: ['dvdf'], expected: 3 }
		],
		external: {
			label: 'Longest Substring Without Repeating Characters on LeetCode',
			url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'
		}
	},
	{
		id: 'valid-brackets',
		title: 'Brackets that close properly',
		pattern: 'Stack',
		difficulty: 'Easy',
		statement: 'The string holds only ()[]{} characters. Return true if every opening bracket is closed by the same kind, in the right order.',
		examples: [
			{ input: 's = "()[]{}"', output: 'true' },
			{ input: 's = "([)]"', output: 'false' }
		],
		hint: 'Push each opener. Each closer must match whatever is on top of the stack.',
		compare: 'exact',
		fn: { python: 'valid_brackets', javascript: 'validBrackets' },
		starter: {
			python: py('def valid_brackets(s: str) -> bool:', 'Return True if the brackets balance.'),
			javascript: js('function validBrackets(s)', 'Return true if the brackets balance.')
		},
		solution: {
			python:
				'def valid_brackets(s: str) -> bool:\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return not stack\n',
			javascript:
				'function validBrackets(s) {\n  const pairs = { ")": "(", "]": "[", "}": "{" };\n  const stack = [];\n  for (const c of s) {\n    if (c in pairs) {\n      if (stack.pop() !== pairs[c]) return false;\n    } else stack.push(c);\n  }\n  return stack.length === 0;\n}\n'
		},
		tests: [
			{ args: ['()'], expected: true },
			{ args: ['()[]{}'], expected: true },
			{ args: ['(]'], expected: false },
			{ args: ['([)]'], expected: false },
			{ args: ['{[]}'], expected: true },
			{ args: ['('], expected: false }
		],
		external: { label: 'Valid Parentheses on LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/' }
	},
	{
		id: 'warmer-days',
		title: 'Days until it gets warmer',
		pattern: 'Stack',
		difficulty: 'Medium',
		statement: 'For each day’s temperature, return how many days you wait until a warmer one. Use 0 if no warmer day comes.',
		examples: [{ input: 'temps = [73, 74, 75, 71, 69, 72, 76, 73]', output: '[1, 1, 4, 2, 1, 1, 0, 0]' }],
		hint: 'Keep a stack of days still waiting. A warmer day answers everyone on top of the stack who is colder.',
		compare: 'exact',
		fn: { python: 'warmer_days', javascript: 'warmerDays' },
		starter: {
			python: py('def warmer_days(temps: list[int]) -> list[int]:', 'Return the wait for each day.'),
			javascript: js('function warmerDays(temps)', 'Return the wait for each day.')
		},
		solution: {
			python:
				'def warmer_days(temps: list[int]) -> list[int]:\n    out = [0] * len(temps)\n    stack = []\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            out[j] = i - j\n        stack.append(i)\n    return out\n',
			javascript:
				'function warmerDays(temps) {\n  const out = new Array(temps.length).fill(0);\n  const stack = [];\n  temps.forEach((t, i) => {\n    while (stack.length && temps[stack.at(-1)] < t) {\n      const j = stack.pop();\n      out[j] = i - j;\n    }\n    stack.push(i);\n  });\n  return out;\n}\n'
		},
		tests: [
			{ args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
			{ args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
			{ args: [[30, 60, 90]], expected: [1, 1, 0] },
			{ args: [[90, 80, 70]], expected: [0, 0, 0] }
		],
		external: { label: 'Daily Temperatures on LeetCode', url: 'https://leetcode.com/problems/daily-temperatures/' }
	}
];

export const problemById = (id: string) => problems.find((p) => p.id === id);
export const patterns = [...new Set(problems.map((p) => p.pattern))];
