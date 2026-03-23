import { create } from 'zustand'
import { postApi } from '@/api/post'
import type { Category, Post, Tag } from '@/types/post'

interface PostState {
  categories: Category[]
  tags: Tag[]
  selectedCategoryId: string | null
  posts: Post[]
  isLoading: boolean
  error: string | null

  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  fetchPosts: (categoryId?: string) => Promise<void>
  setSelectedCategory: (categoryId: string | null) => void
}

export const usePostStore = create<PostState>((set, get) => ({
  categories: [],
  tags: [],
  selectedCategoryId: null,
  posts: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const categories = await postApi.getCategoryList()
      set({ categories, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchTags: async () => {
    try {
      const tags = await postApi.getTagList()
      set({ tags })
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  },

  fetchPosts: async (categoryId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await postApi.getPostList(categoryId)
      set({ posts: data.list || [], isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId })
    get().fetchPosts(categoryId || undefined)
  },
}))
