import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api.js'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const { courses } = await api.courses.list()
      setCourses(courses)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleModule = async (courseId, moduleId, currentEnabled) => {
    // Optimistic update
    setCourses(cs => cs.map(c => c.id !== courseId ? c : {
      ...c, modules: c.modules.map(m => m.id !== moduleId ? m : { ...m, is_enabled: !currentEnabled })
    }))
    try {
      await api.courses.updateModule(courseId, moduleId, { is_enabled: !currentEnabled })
    } catch {
      load() // revert on failure
    }
  }

  const toggleLesson = async (courseId, moduleId, lessonId, currentEnabled) => {
    setCourses(cs => cs.map(c => c.id !== courseId ? c : {
      ...c, modules: c.modules.map(m => m.id !== moduleId ? m : {
        ...m, lessons: m.lessons.map(l => l.id !== lessonId ? l : { ...l, is_enabled: !currentEnabled })
      })
    }))
    try {
      await api.courses.updateLesson(courseId, moduleId, lessonId, { is_enabled: !currentEnabled })
    } catch {
      load()
    }
  }

  const markLessonHasSlides = (courseId, moduleId, lessonId) => {
    setCourses(cs => cs.map(c => c.id !== courseId ? c : {
      ...c, modules: c.modules.map(m => m.id !== moduleId ? m : {
        ...m, lessons: m.lessons.map(l => l.id !== lessonId ? l : { ...l, has_slides: true })
      })
    }))
  }

  return { courses, loading, error, reload: load, toggleModule, toggleLesson, markLessonHasSlides }
}

export function useLesson(lessonId) {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    try {
      const { lesson } = await api.lessons.get(lessonId)
      setLesson(lesson)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => { load() }, [load])

  const saveSlides = async (data) => {
    await api.lessons.saveSlides(lessonId, data)
    setLesson(l => ({ ...l, slides: data }))
  }

  const addResource = async (resource) => {
    const { resource: saved } = await api.lessons.addResource(lessonId, resource)
    setLesson(l => ({ ...l, resources: [...(l.resources || []), saved] }))
    return saved
  }

  const toggleResource = async (resourceId, currentEnabled) => {
    setLesson(l => ({ ...l, resources: l.resources.map(r => r.id !== resourceId ? r : { ...r, is_enabled: !currentEnabled }) }))
    try {
      await api.lessons.updateResource(lessonId, resourceId, { is_enabled: !currentEnabled })
    } catch {
      load()
    }
  }

  const deleteResource = async (resourceId) => {
    setLesson(l => ({ ...l, resources: l.resources.filter(r => r.id !== resourceId) }))
    await api.lessons.deleteResource(lessonId, resourceId)
  }

  return { lesson, loading, reload: load, saveSlides, addResource, toggleResource, deleteResource }
}
