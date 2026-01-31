import { useState, useCallback, useEffect } from 'react';

export interface BudgetCategory {
  id: string;
  name: string;
  nameEs: string;
  percentage: number;
  amount: number;
  type: 'fixed' | 'savings' | 'variable';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  allocationPercentage: number;
  dueDate?: Date;
}

export interface PeriodicExpense {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: Date;
  frequency: 'monthly' | 'quarterly' | 'yearly';
}

export interface Income {
  id: string;
  date: Date;
  concept: string;
  amount: number;
  includesGas: boolean;
}

export interface BudgetState {
  totalBalance: number;
  categories: BudgetCategory[];
  goals: Goal[];
  periodicExpenses: PeriodicExpense[];
  incomeHistory: Income[];
}

const STORAGE_KEY = 'minomina_budget_state';

const initialCategories: BudgetCategory[] = [
  { id: 'fixed', name: 'Fixed', nameEs: 'Fijos', percentage: 50, amount: 0, type: 'fixed' },
  { id: 'savings', name: 'Future', nameEs: 'Futuro', percentage: 30, amount: 0, type: 'savings' },
  { id: 'variable', name: 'Lifestyle', nameEs: 'Lifestyle', percentage: 20, amount: 0, type: 'variable' },
];

const getInitialState = (): BudgetState => {
  if (typeof window === 'undefined') {
    return {
      totalBalance: 0,
      categories: initialCategories,
      goals: [],
      periodicExpenses: [],
      incomeHistory: [],
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        goals: parsed.goals.map((g: Goal) => ({
          ...g,
          dueDate: g.dueDate ? new Date(g.dueDate) : undefined,
        })),
        periodicExpenses: parsed.periodicExpenses.map((e: PeriodicExpense) => ({
          ...e,
          dueDate: new Date(e.dueDate),
        })),
        incomeHistory: parsed.incomeHistory.map((i: Income) => ({
          ...i,
          date: new Date(i.date),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading budget state:', error);
  }

  return {
    totalBalance: 0,
    categories: initialCategories,
    goals: [],
    periodicExpenses: [],
    incomeHistory: [],
  };
};

export function useBudget() {
  const [state, setState] = useState<BudgetState>(getInitialState);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving budget state:', error);
    }
  }, [state]);

  const addIncome = useCallback((income: Omit<Income, 'id'>, distribution: { fixed: number; savings: number; variable: number }) => {
    setState(prev => {
      const newIncome: Income = {
        ...income,
        id: Date.now().toString(),
      };

      const newCategories = prev.categories.map(cat => {
        if (cat.id === 'fixed') return { ...cat, amount: cat.amount + distribution.fixed };
        if (cat.id === 'savings') return { ...cat, amount: cat.amount + distribution.savings };
        if (cat.id === 'variable') return { ...cat, amount: cat.amount + distribution.variable };
        return cat;
      });

      return {
        ...prev,
        totalBalance: prev.totalBalance + income.amount,
        categories: newCategories,
        incomeHistory: [newIncome, ...prev.incomeHistory],
      };
    });
  }, []);

  const transferBetweenCategories = useCallback((fromId: string, toId: string, amount: number) => {
    setState(prev => {
      const newCategories = prev.categories.map(cat => {
        if (cat.id === fromId) return { ...cat, amount: cat.amount - amount };
        if (cat.id === toId) return { ...cat, amount: cat.amount + amount };
        return cat;
      });

      return {
        ...prev,
        categories: newCategories,
      };
    });
  }, []);

  const fundGoal = useCallback((goalId: string, amount: number, fromCategoryId: string) => {
    setState(prev => {
      const newGoals = prev.goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, currentAmount: goal.currentAmount + amount };
        }
        return goal;
      });

      const newCategories = prev.categories.map(cat => {
        if (cat.id === fromCategoryId) {
          return { ...cat, amount: cat.amount - amount };
        }
        return cat;
      });

      return {
        ...prev,
        goals: newGoals,
        categories: newCategories,
      };
    });
  }, []);

  const fundPeriodicExpense = useCallback((expenseId: string, amount: number, fromCategoryId: string) => {
    setState(prev => {
      const newExpenses = prev.periodicExpenses.map(expense => {
        if (expense.id === expenseId) {
          return { ...expense, currentAmount: expense.currentAmount + amount };
        }
        return expense;
      });

      const newCategories = prev.categories.map(cat => {
        if (cat.id === fromCategoryId) {
          return { ...cat, amount: cat.amount - amount };
        }
        return cat;
      });

      return {
        ...prev,
        periodicExpenses: newExpenses,
        categories: newCategories,
      };
    });
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, { ...goal, id: Date.now().toString(), currentAmount: 0 }],
    }));
  }, []);

  const updateGoal = useCallback((goalId: string, updates: Partial<Omit<Goal, 'id'>>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ),
    }));
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== goalId),
    }));
  }, []);

  const addPeriodicExpense = useCallback((expense: Omit<PeriodicExpense, 'id' | 'currentAmount'>) => {
    setState(prev => ({
      ...prev,
      periodicExpenses: [...prev.periodicExpenses, { ...expense, id: Date.now().toString(), currentAmount: 0 }],
    }));
  }, []);

  const updatePeriodicExpense = useCallback((expenseId: string, updates: Partial<Omit<PeriodicExpense, 'id'>>) => {
    setState(prev => ({
      ...prev,
      periodicExpenses: prev.periodicExpenses.map(expense =>
        expense.id === expenseId ? { ...expense, ...updates } : expense
      ),
    }));
  }, []);

  const deletePeriodicExpense = useCallback((expenseId: string) => {
    setState(prev => ({
      ...prev,
      periodicExpenses: prev.periodicExpenses.filter(expense => expense.id !== expenseId),
    }));
  }, []);

  return {
    ...state,
    addIncome,
    transferBetweenCategories,
    fundGoal,
    fundPeriodicExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    addPeriodicExpense,
    updatePeriodicExpense,
    deletePeriodicExpense,
  };
}
