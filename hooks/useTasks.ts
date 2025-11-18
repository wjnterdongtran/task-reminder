'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, TaskFormData } from '@/types/task';

const STORAGE_KEY = 'task-reminder-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTasks(parsed);
        } catch (error) {
          console.error('Error parsing tasks from localStorage:', error);
          setTasks([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      url: formData.url,
      status: TaskStatus.INIT,
      reminderInterval: formData.reminderInterval,
      createdAt: new Date().toISOString(),
      lastRemindedAt: null,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const markAsReminded = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: TaskStatus.NEED_TAKING_CARE,
              lastRemindedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }, []);

  const setAllTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  return {
    tasks,
    isLoaded,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    markAsReminded,
    setAllTasks,
  };
}
