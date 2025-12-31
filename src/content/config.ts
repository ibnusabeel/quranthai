import { defineCollection, z } from 'astro:content';

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
    type: 'content',
    schema: z.object({
        surahNumber: z.coerce.number(),
        title: z.string().optional(),
        ayahStart: z.number(),
        ayahEnd: z.number(),
        ayahs: z.array(z.object({
            ayahNumber: z.number(),
            arabic: z.string().optional(),
            thai: z.string().optional(),
        })).optional(),
    }),
});

export const collections = {
    books: booksCollection,
    tafsir: tafsirCollection,
};
