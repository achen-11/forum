import { create } from 'zustand'
import { postApi } from '@/api/post'
import type { Category, Post } from '@/types/post'

interface PostState {
  categories: Category[]
  selectedCategoryId: string | null
  posts: Post[]
  isLoading: boolean
  error: string | null

  fetchCategories: () => Promise<void>
  fetchPosts: (categoryId?: string) => Promise<void>
  setSelectedCategory: (categoryId: string | null) => void
}

export const usePostStore = create<PostState>((set, get) => ({
  categories: [],
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

  fetchPosts: async (categoryId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const posts = await postApi.getPostList(categoryId)
      set({ posts, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId })
    get().fetchPosts(categoryId || undefined)
  },
}))
