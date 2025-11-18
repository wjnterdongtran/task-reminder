'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, TaskFormData } from '@/types/task';
import * as taskService from '@/lib/supabase/taskService';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from Supabase on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await taskService.getAllTasks();
        setTasks(fetchedTasks);
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setIsLoaded(true);
      }
    };

    loadTasks();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isLoaded) return;

    const unsubscribe = taskService.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => {
      unsubscribe();
    };
  }, [isLoaded]);

  const addTask = useCallback(async (formData: TaskFormData) => {
    try {
      const newTask = await taskService.createTask(formData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Failed to add task');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      try {
        const updatedTask = await taskService.updateTaskStatus(id, status);
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? updatedTask : task))
        );
      } catch (err) {
        console.error('Error updating task status:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to update task status'
        );
        throw err;
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, []);

  const markAsReminded = useCallback(async (id: string) => {
    try {
      const updatedTask = await taskService.markTaskAsReminded(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error('Error marking task as reminded:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to mark task as reminded'
      );
      throw err;
    }
  }, []);

  const setAllTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  return {
    tasks,
    isLoaded,
    error,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    markAsReminded,
    setAllTasks,
  };
}
