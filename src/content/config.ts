import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const booksCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        titleThai: z.string(),
        titleArabic: z.string().optional(),
        author: z.string(),
        authorArabic: z.string().optional(),
        coverImage: z.string().optional(),
    }),
});

const tafsirCollection = defineCollection({
    loader: glob({ pattern: '**/*.mdoc', base: "./src/content/tafsir" }),
    schema: z.object({
        surahNumber: z.coerce.number().optional(),
        title: z.string().optional(),
        nameThai: z.string().optional(),
        nameArabic: z.string().optional(),
        ayahs: z.array(z.object({
            ayahNumber: z.number(),
            arabic: z.string().optional(),
            thai: z.string().optional(),
            audio: z.string().optional(),
            description: z.any(), // Supports both string and Markdoc AST
        })).optional(),
    }),
});

export const collections = {
    books: booksCollection,
    tafsir: tafsirCollection,
};
