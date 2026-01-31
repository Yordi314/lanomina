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

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'biweekly';
  fortnight?: 1 | 2 | null; // null means both/monthly
  icon?: string;
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  categoryId: string; // 'fixed', 'savings', 'variable', or goal/periodic ID
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

export interface BudgetState {
  totalBalance: number;
  gasAvailable: number;
  categories: BudgetCategory[];
  goals: Goal[];
  periodicExpenses: PeriodicExpense[];
  incomeHistory: Income[];
  fixedBills: FixedBill[];
  loans: Loan[];
  expenses: Expense[];
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
      gasAvailable: 0,
      categories: initialCategories,
      goals: [],
      periodicExpenses: [],
      incomeHistory: [],
      fixedBills: [],
      loans: [],
      expenses: [],
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        gasAvailable: parsed.gasAvailable || 0,
        goals: (parsed.goals || []).map((g: Goal) => ({
          ...g,
          dueDate: g.dueDate ? new Date(g.dueDate) : undefined,
        })),
        periodicExpenses: (parsed.periodicExpenses || []).map((e: PeriodicExpense) => ({
          ...e,
          dueDate: new Date(e.dueDate),
        })),
        incomeHistory: (parsed.incomeHistory || []).map((i: Income) => ({
          ...i,
          date: new Date(i.date),
        })),
        fixedBills: parsed.fixedBills || [],
        loans: (parsed.loans || []).map((l: Loan) => ({
          ...l,
          startDate: new Date(l.startDate),
        })),
        expenses: (parsed.expenses || []).map((e: Expense) => ({
          ...e,
          date: new Date(e.date),
        })),
      };
    }
  } catch (error) {
    console.error('Error loading budget state:', error);
  }

  return {
    totalBalance: 0,
    gasAvailable: 0,
    categories: initialCategories,
    goals: [],
    periodicExpenses: [],
    incomeHistory: [],
    fixedBills: [],
    loans: [],
    expenses: [],
  };
};

export function useBudget() {
  const [state, setState] = useState<BudgetState>(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving budget state:', error);
    }
  }, [state]);

  // Calculate total fixed bills per fortnight based on current date
  const getTotalFixedBills = useCallback(() => {
    const currentDay = new Date().getDate();
    // Logic: 1-15 = 1st, 16+ = 2nd
    const currentFortnight = currentDay <= 15 ? 1 : 2;

    return state.fixedBills.reduce((sum, bill) => {
      // Robust check for fortnight filtering
      // Explicitly checking for 1 or 2, handling potential string/number mismatch from storage
      const billFortnight = bill.fortnight;

      // Check if bill logic is specific to a fortnight
      // We check if it is explicitly 1 or 2 (or string "1", "2")
      if (billFortnight === 1 || billFortnight === 2 || billFortnight === '1' as any || billFortnight === '2' as any) {
        // Normalize comparison
        // eslint-disable-next-line eqeqeq
        if (billFortnight != currentFortnight) {
          // Skip if it doesn't match
          return sum;
        }
        // If it matches, pay FULL amount (Frequency is implicitly biweekly here)
        return sum + bill.amount;
      }

      // If we are here, bill is monthly (null/undefined/both)
      // Pay half
      return sum + (bill.amount / 2);
    }, 0);
  }, [state.fixedBills]);

  const resetData = useCallback(() => {
    setState({
      totalBalance: 0,
      gasAvailable: 0,
      categories: initialCategories,
      goals: [],
      periodicExpenses: [],
      incomeHistory: [],
      fixedBills: [],
      loans: [],
      expenses: [],
    });
  }, []);



  const addIncome = useCallback((income: Omit<Income, 'id'>, distribution: { fixed: number; savings: number; variable: number }) => {
    setState(prev => {
      const newIncome: Income = {
        ...income,
        // Override concept if it's a gas-only entry (logic handled in UI, but safe to force here if needed)
        concept: income.includesGas ? 'Gasolina' : income.concept,
        id: Date.now().toString(),
      };

      // If includesGas is true, this is a Gasoline Deposit ONLY
      // It goes fully to Fixed Expenses and Gas Available
      if (income.includesGas) {
        const newCategories = prev.categories.map(cat => {
          if (cat.id === 'fixed') return { ...cat, amount: cat.amount + income.amount };
          return cat;
        });

        return {
          ...prev,
          totalBalance: prev.totalBalance + income.amount,
          gasAvailable: prev.gasAvailable + income.amount,
          categories: newCategories,
          incomeHistory: [newIncome, ...prev.incomeHistory],
        };
      }

      // Normal Income (Payroll) distribution
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

  const addExternalIncome = useCallback((amount: number, categoryId: string, concept: string) => {
    setState(prev => {
      const newIncome: Income = {
        id: Date.now().toString(),
        date: new Date(),
        concept: concept || 'Ingreso Extra',
        amount: amount,
        includesGas: false, // External income is not gas by default logic usually
      };

      const newCategories = prev.categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, amount: cat.amount + amount };
        }
        return cat;
      });

      return {
        ...prev,
        totalBalance: prev.totalBalance + amount,
        categories: newCategories,
        // Optional: Do we want to record this in general history? User requested "ingresar esos montos", implies tracking.
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

  // Fixed Bills CRUD
  const addFixedBill = useCallback((bill: Omit<FixedBill, 'id'>) => {
    setState(prev => ({
      ...prev,
      fixedBills: [...prev.fixedBills, { ...bill, id: Date.now().toString() }],
    }));
  }, []);

  const updateFixedBill = useCallback((billId: string, updates: Partial<Omit<FixedBill, 'id'>>) => {
    setState(prev => ({
      ...prev,
      fixedBills: prev.fixedBills.map(bill =>
        bill.id === billId ? { ...bill, ...updates } : bill
      ),
    }));
  }, []);

  const deleteFixedBill = useCallback((billId: string) => {
    setState(prev => ({
      ...prev,
      fixedBills: prev.fixedBills.filter(bill => bill.id !== billId),
    }));
  }, []);

  // Expense Tracking
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setState(prev => {
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
      };

      // Deduct from the appropriate category/goal/periodic
      let newCategories = prev.categories;
      let newGoals = prev.goals;
      let newPeriodicExpenses = prev.periodicExpenses;

      if (expense.categoryType === 'fixed' || expense.categoryType === 'savings' || expense.categoryType === 'variable') {
        newCategories = prev.categories.map(cat => {
          if (cat.id === expense.categoryId) {
            return { ...cat, amount: Math.max(0, cat.amount - expense.amount) };
          }
          return cat;
        });
      } else if (expense.categoryType === 'goal') {
        newGoals = prev.goals.map(goal => {
          if (goal.id === expense.categoryId) {
            return { ...goal, currentAmount: Math.max(0, goal.currentAmount - expense.amount) };
          }
          return goal;
        });
      } else if (expense.categoryType === 'periodic') {
        newPeriodicExpenses = prev.periodicExpenses.map(pe => {
          if (pe.id === expense.categoryId) {
            return { ...pe, currentAmount: Math.max(0, pe.currentAmount - expense.amount) };
          }
          return pe;
        });
      }

      // Calculate new total balance
      const newTotalBalance = newCategories.reduce((sum, cat) => sum + cat.amount, 0);

      // If it's a Gas Expense, deduct from Gas Available
      const newGasAvailable = expense.isGas
        ? Math.max(0, prev.gasAvailable - expense.amount)
        : prev.gasAvailable;

      return {
        ...prev,
        totalBalance: newTotalBalance,
        gasAvailable: newGasAvailable,
        categories: newCategories,
        goals: newGoals,
        periodicExpenses: newPeriodicExpenses,
        expenses: [newExpense, ...prev.expenses],
      };
    });
  }, []);

  const deleteExpense = useCallback((expenseId: string) => {
    setState(prev => {
      const expense = prev.expenses.find(e => e.id === expenseId);
      if (!expense) return prev;

      // Refund the amount back to the category
      let newCategories = prev.categories;
      let newGoals = prev.goals;
      let newPeriodicExpenses = prev.periodicExpenses;

      if (expense.categoryType === 'fixed' || expense.categoryType === 'savings' || expense.categoryType === 'variable') {
        newCategories = prev.categories.map(cat => {
          if (cat.id === expense.categoryId) {
            return { ...cat, amount: cat.amount + expense.amount };
          }
          return cat;
        });
      } else if (expense.categoryType === 'goal') {
        newGoals = prev.goals.map(goal => {
          if (goal.id === expense.categoryId) {
            return { ...goal, currentAmount: goal.currentAmount + expense.amount };
          }
          return goal;
        });
      } else if (expense.categoryType === 'periodic') {
        newPeriodicExpenses = prev.periodicExpenses.map(pe => {
          if (pe.id === expense.categoryId) {
            return { ...pe, currentAmount: pe.currentAmount + expense.amount };
          }
          return pe;
        });
      }

      const newTotalBalance = newCategories.reduce((sum, cat) => sum + cat.amount, 0);

      // Refund Gas if applicable
      const newGasAvailable = expense.isGas
        ? prev.gasAvailable + expense.amount
        : prev.gasAvailable;

      return {
        ...prev,
        totalBalance: newTotalBalance,
        gasAvailable: newGasAvailable,
        categories: newCategories,
        goals: newGoals,
        periodicExpenses: newPeriodicExpenses,
        expenses: prev.expenses.filter(e => e.id !== expenseId),
      };
    });
  }, []);

  // Loans CRUD
  const addLoan = useCallback((loan: Omit<Loan, 'id'>) => {
    setState(prev => ({
      ...prev,
      loans: [...(prev.loans || []), { ...loan, id: Date.now().toString() }],
    }));
  }, []);

  const updateLoan = useCallback((loanId: string, updates: Partial<Omit<Loan, 'id'>>) => {
    setState(prev => ({
      ...prev,
      loans: (prev.loans || []).map(loan =>
        loan.id === loanId ? { ...loan, ...updates } : loan
      ),
    }));
  }, []);

  const deleteLoan = useCallback((loanId: string) => {
    setState(prev => ({
      ...prev,
      loans: (prev.loans || []).filter(loan => loan.id !== loanId),
    }));
  }, []);

  // Calculate total loan payments per fortnight
  const getTotalLoansPayment = useCallback(() => {
    return (state.loans || []).reduce((sum, loan) => sum + loan.paymentPerFortnight, 0);
  }, [state.loans]);

  // Updated Fixed Surplus Calculation to include Loans
  const getFixedSurplus = useCallback(() => {
    const fixedCategory = state.categories.find(c => c.id === 'fixed');
    if (!fixedCategory) return 0;

    const totalBills = getTotalFixedBills();
    const totalLoans = getTotalLoansPayment();

    return Math.max(0, fixedCategory.amount - totalBills - totalLoans);
  }, [state.categories, getTotalFixedBills, getTotalLoansPayment]);

  return {
    ...state,
    getTotalFixedBills,
    getFixedSurplus,
    getTotalLoansPayment,
    addIncome,
    addExternalIncome,
    transferBetweenCategories,
    fundGoal,
    fundPeriodicExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    addPeriodicExpense,
    updatePeriodicExpense,
    deletePeriodicExpense,
    addFixedBill,
    updateFixedBill,
    deleteFixedBill,
    addLoan,
    updateLoan,
    deleteLoan,
    addExpense,
    deleteExpense,
    resetData,
  };
}
