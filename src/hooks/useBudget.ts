
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';

export interface BudgetCategory {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  percentage: number;
  amount: number;
  type: string;
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

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'biweekly';
  fortnight?: 1 | 2 | null;
  icon?: string;
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  categoryId: string;
  categoryType: 'fixed' | 'savings' | 'variable' | 'goal' | 'periodic';
  description: string;
  isGas?: boolean;
}

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  durationValue: number;
  durationType: 'fortnights' | 'months';
  paymentPerFortnight: number;
  startDate: Date;
}

export function useBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('created_at');
      if (error) throw error;
      return data.map((cat: any) => ({
        ...cat,
        percentage: Number(cat.percentage),
        amount: Number(cat.amount),
        type: ['fixed', 'savings', 'variable'].includes(cat.slug) ? cat.slug : cat.type
      })) as BudgetCategory[];
    },
    enabled: !!user,
  });

  const { data: goals = [], isLoading: isGoalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('*').order('created_at');
      if (error) throw error;
      return data.map((g: any) => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        allocationPercentage: Number(g.allocation_percentage),
        dueDate: g.due_date ? new Date(g.due_date) : undefined,
      })) as Goal[];
    },
    enabled: !!user,
  });

  const { data: periodicExpenses = [] } = useQuery({
    queryKey: ['periodicExpenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('periodic_expenses').select('*').order('created_at');
      if (error) throw error;
      return data.map((e: any) => ({
        id: e.id,
        name: e.name,
        targetAmount: Number(e.target_amount),
        currentAmount: Number(e.current_amount),
        dueDate: new Date(e.due_date),
        frequency: e.frequency,
      })) as PeriodicExpense[];
    },
    enabled: !!user,
  });

  const { data: incomeHistory = [] } = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('incomes').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data.map((i: any) => ({
        id: i.id,
        date: new Date(i.date),
        concept: i.concept,
        amount: Number(i.amount),
        includesGas: i.includes_gas,
      })) as Income[];
    },
    enabled: !!user,
  });

  const { data: fixedBills = [] } = useQuery({
    queryKey: ['fixedBills'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fixed_bills').select('*').order('created_at');
      if (error) throw error;
      return data.map((b: any) => ({
        ...b,
        amount: Number(b.amount)
      })) as FixedBill[];
    },
    enabled: !!user,
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('loans').select('*').order('created_at');
      if (error) throw error;
      return data.map((l: any) => ({
        id: l.id,
        name: l.name,
        totalAmount: Number(l.total_amount),
        durationValue: Number(l.duration_value),
        durationType: l.duration_type,
        paymentPerFortnight: Number(l.payment_per_fortnight),
        startDate: new Date(l.start_date),
      })) as Loan[];
    },
    enabled: !!user,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data.map((e: any) => ({
        id: e.id,
        date: new Date(e.date),
        amount: Number(e.amount),
        categoryId: e.category_id,
        categoryType: e.category_type,
        description: e.description,
        isGas: e.is_gas,
      })) as Expense[];
    },
    enabled: !!user,
  });

  // Derived State
  const totalBalance = categories.reduce((sum, cat) => sum + cat.amount, 0);

  // Helper for gas: manually summing fixed expenses marked as gas if needed, or tracking via logic?
  // Old logic: gasAvailable was just part of Fixed category or tracked separately?
  // Old logic: "if it's a Gasoline Deposit ONLY... It goes fully to Fixed Expenses and Gas Available"
  // "gasAvailable" was a number in state.
  // In pure DB, we don't have a "gasAvailable" field. We have to derive it.
  // "Gas Available" = (Sum of Incomes where includesGas=true) - (Sum of Expenses where isGas=true) ??
  // Or is it a subset of 'Fixed' category?
  // Let's assume for now we calculate it on the fly:
  const totalGasIncome = incomeHistory.filter(i => i.includesGas).reduce((sum, i) => sum + i.amount, 0);
  const totalGasExpenses = expenses.filter(e => e.isGas).reduce((sum, e) => sum + e.amount, 0);
  const gasAvailable = Math.max(0, totalGasIncome - totalGasExpenses);


  // Mutations (Helpers)

  const addIncome = useMutation({
    mutationFn: async ({ income, distribution }: { income: Omit<Income, 'id'>, distribution: { fixed: number; savings: number; variable: number } }) => {
      // 1. Insert Income
      const { data: incomeData, error: incomeError } = await supabase.from('incomes').insert({
        user_id: user?.id,
        date: income.date.toISOString(),
        concept: income.concept,
        amount: income.amount,
        includes_gas: income.includesGas,
      }).select().single();
      if (incomeError) throw incomeError;

      // 2. Update Categories
      if (income.includesGas) {
        // Find 'fixed' category
        const fixedCat = categories.find(c => c.slug === 'fixed');
        if (fixedCat) {
          await supabase.from('categories').update({ amount: fixedCat.amount + income.amount }).eq('id', fixedCat.id);
        }
      } else {
        // Distribute
        const fixedCat = categories.find(c => c.slug === 'fixed');
        const savingsCat = categories.find(c => c.slug === 'savings');
        const variableCat = categories.find(c => c.slug === 'variable');

        if (fixedCat) await supabase.from('categories').update({ amount: fixedCat.amount + distribution.fixed }).eq('id', fixedCat.id);
        if (savingsCat) await supabase.from('categories').update({ amount: savingsCat.amount + distribution.savings }).eq('id', savingsCat.id);
        if (variableCat) await supabase.from('categories').update({ amount: variableCat.amount + distribution.variable }).eq('id', variableCat.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Ingreso registrado" });
    },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message })
  });

  const addExternalIncome = useMutation({
    mutationFn: async ({ amount, categoryId, concept }: { amount: number, categoryId: string, concept: string }) => {
      // 1. Insert Income (for history)
      await supabase.from('incomes').insert({
        user_id: user?.id,
        date: new Date().toISOString(),
        concept: concept || 'Ingreso Extra',
        amount: amount,
        includes_gas: false,
      });

      // 2. Update Category
      const cat = categories.find(c => c.id === categoryId);
      if (cat) {
        await supabase.from('categories').update({ amount: cat.amount + amount }).eq('id', categoryId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Ingreso extra registrado" });
    }
  });

  const transferBetweenCategories = useMutation({
    mutationFn: async ({ fromId, toId, amount }: { fromId: string, toId: string, amount: number }) => {
      const fromCat = categories.find(c => c.id === fromId);
      const toCat = categories.find(c => c.id === toId);

      if (fromCat && toCat) {
        await supabase.from('categories').update({ amount: fromCat.amount - amount }).eq('id', fromId);
        await supabase.from('categories').update({ amount: toCat.amount + amount }).eq('id', toId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Transferencia realizada" });
    }
  });

  // Generic Generic Mutations

  // Goals
  const addGoalMutation = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
      return await supabase.from('goals').insert({
        user_id: user?.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        allocation_percentage: goal.allocationPercentage,
        due_date: goal.dueDate?.toISOString(),
        current_amount: 0
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Omit<Goal, 'id'>> }) => {
      const payload: any = {};
      if (updates.name) payload.name = updates.name;
      if (updates.targetAmount) payload.target_amount = updates.targetAmount;
      if (updates.allocationPercentage) payload.allocation_percentage = updates.allocationPercentage;
      if (updates.dueDate) payload.due_date = updates.dueDate.toISOString();

      return await supabase.from('goals').update(payload).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => supabase.from('goals').delete().eq('id', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  // Periodic Expenses
  const addPeriodicMutation = useMutation({
    mutationFn: async (expense: Omit<PeriodicExpense, 'id' | 'currentAmount'>) => {
      return await supabase.from('periodic_expenses').insert({
        user_id: user?.id,
        name: expense.name,
        target_amount: expense.targetAmount,
        due_date: expense.dueDate.toISOString(),
        frequency: expense.frequency,
        current_amount: 0
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['periodicExpenses'] })
  });

  const updatePeriodicMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Omit<PeriodicExpense, 'id'>> }) => {
      const payload: any = {};
      if (updates.name) payload.name = updates.name;
      if (updates.targetAmount) payload.target_amount = updates.targetAmount;
      if (updates.dueDate) payload.due_date = updates.dueDate.toISOString();

      return await supabase.from('periodic_expenses').update(payload).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['periodicExpenses'] })
  });

  const deletePeriodicMutation = useMutation({
    mutationFn: async (id: string) => supabase.from('periodic_expenses').delete().eq('id', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['periodicExpenses'] })
  });

  // Fixed Bills
  const addFixedBillMutation = useMutation({
    mutationFn: async (bill: Omit<FixedBill, 'id'>) => {
      return await supabase.from('fixed_bills').insert({
        user_id: user?.id,
        name: bill.name,
        amount: bill.amount,
        frequency: bill.frequency,
        fortnight: bill.fortnight,
        icon: bill.icon
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedBills'] })
  });

  const updateFixedBillMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Omit<FixedBill, 'id'>> }) => {
      return await supabase.from('fixed_bills').update(updates).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedBills'] })
  });

  const deleteFixedBillMutation = useMutation({
    mutationFn: async (id: string) => supabase.from('fixed_bills').delete().eq('id', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedBills'] })
  });

  // Loans
  const addLoanMutation = useMutation({
    mutationFn: async (loan: Omit<Loan, 'id'>) => {
      return await supabase.from('loans').insert({
        user_id: user?.id,
        name: loan.name,
        total_amount: loan.totalAmount,
        duration_value: loan.durationValue,
        duration_type: loan.durationType,
        payment_per_fortnight: loan.paymentPerFortnight,
        start_date: loan.startDate.toISOString()
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] })
  });

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Omit<Loan, 'id'>> }) => {
      const payload: any = { ...updates };
      if (updates.totalAmount) payload.total_amount = updates.totalAmount;
      if (updates.durationValue) payload.duration_value = updates.durationValue;
      if (updates.durationType) payload.duration_type = updates.durationType;
      if (updates.paymentPerFortnight) payload.payment_per_fortnight = updates.paymentPerFortnight;
      if (updates.startDate) payload.start_date = updates.startDate.toISOString();
      delete payload.totalAmount;
      delete payload.durationValue; // Cleanup
      delete payload.durationType;
      delete payload.paymentPerFortnight;
      delete payload.startDate;

      return await supabase.from('loans').update(payload).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] })
  });

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: string) => supabase.from('loans').delete().eq('id', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] })
  });


  // Expenses
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id'>) => {
      // 1. Insert Expense
      await supabase.from('expenses').insert({
        user_id: user?.id,
        date: expense.date.toISOString(),
        amount: expense.amount,
        category_id: expense.categoryId,
        category_type: expense.categoryType,
        description: expense.description,
        is_gas: expense.isGas
      });

      // 2. Deduct from Source
      if (['fixed', 'savings', 'variable'].includes(expense.categoryType)) {
        const cat = categories.find(c => c.id === expense.categoryId);
        if (cat) await supabase.from('categories').update({ amount: Math.max(0, cat.amount - expense.amount) }).eq('id', cat.id);
      } else if (expense.categoryType === 'goal') {
        const goal = goals.find(g => g.id === expense.categoryId);
        if (goal) await supabase.from('goals').update({ current_amount: Math.max(0, goal.currentAmount - expense.amount) }).eq('id', goal.id);
      } else if (expense.categoryType === 'periodic') {
        const p = periodicExpenses.find(pe => pe.id === expense.categoryId);
        if (p) await supabase.from('periodic_expenses').update({ current_amount: Math.max(0, p.currentAmount - expense.amount) }).eq('id', p.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['periodicExpenses'] });
      toast({ title: "Gasto registrado" });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) return;

      // 1. Delete Expense
      await supabase.from('expenses').delete().eq('id', expenseId);

      // 2. Refund Source
      if (['fixed', 'savings', 'variable'].includes(expense.categoryType)) {
        const cat = categories.find(c => c.id === expense.categoryId);
        if (cat) await supabase.from('categories').update({ amount: cat.amount + expense.amount }).eq('id', cat.id);
      } else if (expense.categoryType === 'goal') {
        const goal = goals.find(g => g.id === expense.categoryId);
        if (goal) await supabase.from('goals').update({ current_amount: goal.currentAmount + expense.amount }).eq('id', goal.id);
      } else if (expense.categoryType === 'periodic') {
        const p = periodicExpenses.find(pe => pe.id === expense.categoryId);
        if (p) await supabase.from('periodic_expenses').update({ current_amount: p.currentAmount + expense.amount }).eq('id', p.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['periodicExpenses'] });
      toast({ title: "Gasto eliminado" });
    }
  });


  // Calculations
  const getTotalFixedBills = useCallback(() => {
    const currentDay = new Date().getDate();
    const currentFortnight = currentDay <= 15 ? 1 : 2;

    return fixedBills.reduce((sum, bill) => {
      const billFortnight = bill.fortnight;
      // Corregir lógica de chequeo de quincena, asumiendo numbers
      if (billFortnight === 1 || billFortnight === 2) {
        if (billFortnight !== currentFortnight) return sum;
        return sum + bill.amount;
      }
      return sum + (bill.amount / 2);
    }, 0);
  }, [fixedBills]);

  const getTotalLoansPayment = useCallback(() => {
    return loans.reduce((sum, loan) => sum + loan.paymentPerFortnight, 0);
  }, [loans]);

  const getFixedSurplus = useCallback(() => {
    // Find Fixed Category by Slug
    const fixedCategory = categories.find(c => c.slug === 'fixed');
    if (!fixedCategory) return 0;

    const totalBills = getTotalFixedBills();
    const totalLoans = getTotalLoansPayment();

    return Math.max(0, fixedCategory.amount - totalBills - totalLoans);
  }, [categories, getTotalFixedBills, getTotalLoansPayment]);

  const resetData = useCallback(async () => {
    // Implement reset if needed, but it's dangerous with real DB
    // Maybe just clear tables?
  }, []);

  return {
    totalBalance,
    gasAvailable,
    categories,
    goals,
    periodicExpenses,
    incomeHistory,
    fixedBills,
    loans,
    expenses,

    getTotalFixedBills,
    getFixedSurplus,
    getTotalLoansPayment,

    // Actions are now Mutations, wrapping them to match old generic signature partially, 
    // or we update components to use these new async signatures

    addIncome: (income: Omit<Income, 'id'>, distribution: { fixed: number; savings: number; variable: number }) => addIncome.mutate({ income, distribution }),
    addExternalIncome: (amount: number, categoryId: string, concept: string) => addExternalIncome.mutate({ amount, categoryId, concept }),
    transferBetweenCategories: (fromId: string, toId: string, amount: number) => transferBetweenCategories.mutate({ fromId, toId, amount }),

    addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => addGoalMutation.mutate(goal),
    updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => updateGoalMutation.mutate({ id, updates }),
    deleteGoal: (id: string) => deleteGoalMutation.mutate(id),

    addPeriodicExpense: (expense: Omit<PeriodicExpense, 'id' | 'currentAmount'>) => addPeriodicMutation.mutate(expense),
    updatePeriodicExpense: (id: string, updates: Partial<Omit<PeriodicExpense, 'id'>>) => updatePeriodicMutation.mutate({ id, updates }),
    deletePeriodicExpense: (id: string) => deletePeriodicMutation.mutate(id),

    addFixedBill: (bill: Omit<FixedBill, 'id'>) => addFixedBillMutation.mutate(bill),
    updateFixedBill: (id: string, updates: Partial<Omit<FixedBill, 'id'>>) => updateFixedBillMutation.mutate({ id, updates }),
    deleteFixedBill: (id: string) => deleteFixedBillMutation.mutate(id),

    addLoan: (loan: Omit<Loan, 'id'>) => addLoanMutation.mutate(loan),
    updateLoan: (id: string, updates: Partial<Omit<Loan, 'id'>>) => updateLoanMutation.mutate({ id, updates }),
    deleteLoan: (id: string) => deleteLoanMutation.mutate(id),

    addExpense: (expense: Omit<Expense, 'id'>) => addExpenseMutation.mutate(expense),
    deleteExpense: (id: string) => deleteExpenseMutation.mutate(id),

    resetData,

    // Expose loading states
    isLoading: isCategoriesLoading || isGoalsLoading // Add others if critical
  };
}
