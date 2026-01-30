import { useState, useCallback } from 'react';

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

const initialCategories: BudgetCategory[] = [
  { id: 'fixed', name: 'Fixed', nameEs: 'Fijos', percentage: 50, amount: 0, type: 'fixed' },
  { id: 'savings', name: 'Future', nameEs: 'Futuro', percentage: 30, amount: 0, type: 'savings' },
  { id: 'variable', name: 'Lifestyle', nameEs: 'Lifestyle', percentage: 20, amount: 0, type: 'variable' },
];

const initialGoals: Goal[] = [
  { id: 'emergency', name: 'Fondo de Emergencia', targetAmount: 100000, currentAmount: 45000, allocationPercentage: 40 },
  { id: 'travel', name: 'Viaje', targetAmount: 50000, currentAmount: 12000, allocationPercentage: 60 },
];

const initialPeriodicExpenses: PeriodicExpense[] = [
  { id: 'university', name: 'Universidad', targetAmount: 35000, currentAmount: 22000, dueDate: new Date('2025-03-15'), frequency: 'quarterly' },
  { id: 'car', name: 'Mantenimiento Carro', targetAmount: 15000, currentAmount: 8500, dueDate: new Date('2025-02-28'), frequency: 'quarterly' },
];

const initialIncomeHistory: Income[] = [
  { id: '1', date: new Date('2025-01-15'), concept: 'Nómina 1ra Quincena', amount: 42000, includesGas: true },
  { id: '2', date: new Date('2025-01-01'), concept: 'Nómina 2da Quincena', amount: 40000, includesGas: false },
];

export function useBudget() {
  const [state, setState] = useState<BudgetState>({
    totalBalance: 65400,
    categories: initialCategories.map((cat, i) => ({
      ...cat,
      amount: i === 0 ? 32700 : i === 1 ? 19620 : 13080,
    })),
    goals: initialGoals,
    periodicExpenses: initialPeriodicExpenses,
    incomeHistory: initialIncomeHistory,
  });

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

  const addPeriodicExpense = useCallback((expense: Omit<PeriodicExpense, 'id' | 'currentAmount'>) => {
    setState(prev => ({
      ...prev,
      periodicExpenses: [...prev.periodicExpenses, { ...expense, id: Date.now().toString(), currentAmount: 0 }],
    }));
  }, []);

  return {
    ...state,
    addIncome,
    transferBetweenCategories,
    fundGoal,
    fundPeriodicExpense,
    addGoal,
    addPeriodicExpense,
  };
}
