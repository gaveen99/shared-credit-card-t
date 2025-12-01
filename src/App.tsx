import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, House, User, ArrowDown, Trash, Funnel } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type TransactionType = 'personal' | 'household' | 'deposit'

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string
}

function App() {
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | TransactionType>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [expenseType, setExpenseType] = useState<'personal' | 'household'>('household')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')

  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')

  const householdTotal = (transactions || [])
    .filter(t => t.type === 'household')
    .reduce((sum, t) => sum + t.amount, 0)

  const depositsTotal = (transactions || [])
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = householdTotal - depositsTotal

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!expenseDescription.trim()) {
      toast.error('Please add a description')
      return
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: expenseType,
      amount,
      description: expenseDescription.trim(),
      date: new Date().toISOString(),
    }

    setTransactions((current) => [newTransaction, ...(current || [])])
    setExpenseAmount('')
    setExpenseDescription('')
    setIsExpenseOpen(false)
    toast.success('Expense added')
  }

  const handleAddDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      description: depositNote.trim() || 'Cash deposit',
      date: new Date().toISOString(),
    }

    setTransactions((current) => [newTransaction, ...(current || [])])
    setDepositAmount('')
    setDepositNote('')
    setIsDepositOpen(false)
    toast.success('Deposit recorded')
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions((current) => (current || []).filter(t => t.id !== id))
    setDeleteId(null)
    toast.success('Transaction deleted')
  }

  const filteredTransactions = (transactions || []).filter(
    t => filter === 'all' || t.type === filter
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Shared Card Tracker</h1>
          <p className="text-sm text-muted-foreground">Track household vs personal expenses</p>
        </div>

        <motion.div 
          className="grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`p-6 ${balance > 0 ? 'bg-gradient-to-br from-red-50 to-card' : balance < 0 ? 'bg-gradient-to-br from-emerald-50 to-card' : 'bg-card'}`}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <p className={`text-5xl font-bold tabular-nums tracking-tight ${
                balance > 0 ? 'text-destructive' : balance < 0 ? 'text-accent' : 'text-foreground'
              }`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {balance > 0 ? 'You should deposit to card' : balance < 0 ? 'Parents owe you' : 'All settled up'}
              </p>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <House className="text-destructive" weight="fill" />
                  <p className="text-sm font-medium text-muted-foreground">Household Spent</p>
                </div>
                <p className="text-3xl font-bold tabular-nums text-destructive">
                  {formatCurrency(householdTotal)}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowDown className="text-accent" weight="fill" />
                  <p className="text-sm font-medium text-muted-foreground">Deposits Received</p>
                </div>
                <p className="text-3xl font-bold tabular-nums text-accent">
                  {formatCurrency(depositsTotal)}
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1" size="lg">
                <Plus className="mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={expenseType === 'household' ? 'default' : 'outline'}
                      onClick={() => setExpenseType('household')}
                      className="h-auto py-4"
                    >
                      <House className="mr-2" weight="fill" />
                      Household
                    </Button>
                    <Button
                      type="button"
                      variant={expenseType === 'personal' ? 'default' : 'outline'}
                      onClick={() => setExpenseType('personal')}
                      className="h-auto py-4"
                    >
                      <User className="mr-2" weight="fill" />
                      Personal
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-description">Description</Label>
                  <Input
                    id="expense-description"
                    placeholder="What was this for?"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddExpense} className="w-full" size="lg">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1" size="lg">
                <ArrowDown className="mr-2" weight="fill" />
                Add Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Cash Deposit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-note">Note (optional)</Label>
                  <Input
                    id="deposit-note"
                    placeholder="Add a note"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddDeposit} className="w-full" size="lg">
                  Record Deposit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[160px]">
                <Funnel className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(transactions || []).length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Add an expense or deposit to get started</p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="h-[500px] rounded-md border">
              <div className="p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {filteredTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`p-4 border-l-4 ${
                        transaction.type === 'household' ? 'border-l-destructive' :
                        transaction.type === 'personal' ? 'border-l-primary' :
                        'border-l-accent'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {transaction.type === 'household' && (
                                <House className="text-destructive" weight="fill" size={18} />
                              )}
                              {transaction.type === 'personal' && (
                                <User className="text-primary" weight="fill" size={18} />
                              )}
                              {transaction.type === 'deposit' && (
                                <ArrowDown className="text-accent" weight="fill" size={18} />
                              )}
                              <Badge variant={
                                transaction.type === 'household' ? 'destructive' :
                                transaction.type === 'deposit' ? 'default' :
                                'secondary'
                              }>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </Badge>
                            </div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`text-lg font-bold tabular-nums ${
                              transaction.type === 'deposit' ? 'text-accent' : 'text-foreground'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : ''}{formatCurrency(transaction.amount)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(transaction.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeleteTransaction(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default App
