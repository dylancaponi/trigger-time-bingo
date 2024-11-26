import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBoardIdFromUrl() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('board')
}

export function updateUrlWithBoardId(boardId: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('board', boardId)
  window.history.pushState({}, '', url)
}
