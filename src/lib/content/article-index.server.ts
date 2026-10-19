import { keywordsOf, quizzesOf, sectionsOf, type TocEntry } from './article-markup';
import type { QuizInfo } from '../progress/requirements';

/**
 * Sections and quick checks of every article, read from the source at build time.
 * The Learn page uses it for search (section headings) and for pack status on cards,
 * without loading any article's code.
 */
export type ArticleIndex = Record<string, { sections: (TocEntry & { keywords: string[] })[]; quizzes: QuizInfo[] }>;

const sources = import.meta.glob<string>('/src/lib/content/articles/*.svelte', { eager: true, query: '?raw', import: 'default' });

export const articleIndex: ArticleIndex = Object.fromEntries(
	Object.entries(sources).map(([path, code]) => {
		const id = path.split('/').pop()!.replace(/\.svelte$/, '');
		const keywords = keywordsOf(code);
		return [id, { sections: sectionsOf(code).map((t) => ({ ...t, keywords: keywords[t.id] ?? [] })), quizzes: quizzesOf(code, id) }];
	})
);
