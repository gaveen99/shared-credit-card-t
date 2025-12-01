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
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, House, User, ArrowDown, Trash, Funnel, ChatCircleText, X } from '@phosphor-icons/react'
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
  
  const [smsText, setSmsText] = useState('')
  const [activeTab, setActiveTab] = useState<'manual' | 'sms'>('manual')

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

  const parseSMSTransaction = (text: string) => {
    const patterns = [
      /(?:spent|charged|purchase|paid|transaction|debited|withdrawn|debit|dr).*?(?:Rs\.?|INR|USD|\$|€|£|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      /(?:Rs\.?|INR|USD|\$|€|£|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:spent|charged|purchase|paid|transaction|debited|withdrawn|debit|dr)/i,
      /(?:amount|amt|txn|value).*?(?:Rs\.?|INR|USD|\$|€|£|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      /(?:Rs\.?|INR|USD|\$|€|£|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      /(?:debited|withdrawn|spent).*?(?:by|of|for)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    ]

    let amount = 0
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''))
        break
      }
    }

    const merchantPatterns = [
      /(?:at|@|merchant|to|on)\s+([A-Z][A-Za-z0-9\s&'.-]+?)(?:\s+on|\s+dated|\s+dt|\.|,|Rs|INR|USD|\$|for|card|a\/c)/i,
      /(?:merchant|store|shop|vendor):\s*([A-Za-z0-9\s&'.-]+?)(?:\.|,|on|card)/i,
      /(?:purchase|payment|txn)\s+(?:at|on|to)\s+([A-Za-z0-9\s&'.-]+?)(?:\s+on|\s+dated|\.)/i,
    ]

    let merchant = ''
    for (const pattern of merchantPatterns) {
      const match = text.match(pattern)
      if (match) {
        merchant = match[1].trim()
        if (merchant.length > 40) {
          merchant = merchant.substring(0, 40) + '...'
        }
        break
      }
    }

    if (!merchant) {
      const words = text.split(/\s+/).filter(word => 
        word.length > 2 && 
        !word.match(/^(Rs|INR|USD|\$|€|£|₹|debited|credited|card|account|a\/c|xxxx)/i)
      )
      const potentialMerchant = words.slice(0, 3).join(' ')
      merchant = potentialMerchant.length > 2 ? potentialMerchant : 'Transaction from SMS'
      if (merchant.length > 40) {
        merchant = merchant.substring(0, 40)
      }
    }

    return { amount, merchant }
  }

  const handleParseSMS = () => {
    if (!smsText.trim()) {
      toast.error('Please paste an SMS message')
      return
    }

    const { amount, merchant } = parseSMSTransaction(smsText)

    if (amount <= 0) {
      toast.error('Could not find a valid amount in the SMS')
      return
    }

    setExpenseAmount(amount.toString())
    setExpenseDescription(merchant || 'Transaction from SMS')
    setSmsText('')
    setActiveTab('manual')
    toast.success('Transaction details filled from SMS')
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      <div className="mx-auto max-w-2xl p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Shared Card Tracker</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Track household vs personal expenses</p>
        </div>

        <motion.div 
          className="grid gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`p-4 sm:p-6 ${balance > 0 ? 'bg-gradient-to-br from-red-50 to-card' : balance < 0 ? 'bg-gradient-to-br from-emerald-50 to-card' : 'bg-card'}`}>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Balance</p>
              <p className={`text-3xl sm:text-5xl font-bold tabular-nums tracking-tight ${
                balance > 0 ? 'text-destructive' : balance < 0 ? 'text-accent' : 'text-foreground'
              }`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {balance > 0 ? 'You should deposit to card' : balance < 0 ? 'Parents owe you' : 'All settled up'}
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-6">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <House className="text-destructive shrink-0" weight="fill" size={18} />
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Household Spent</p>
                </div>
                <p className="text-xl sm:text-3xl font-bold tabular-nums text-destructive">
                  {formatCurrency(householdTotal)}
                </p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ArrowDown className="text-accent shrink-0" weight="fill" size={18} />
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Deposits Received</p>
                </div>
                <p className="text-xl sm:text-3xl font-bold tabular-nums text-accent">
                  {formatCurrency(depositsTotal)}
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Dialog open={isExpenseOpen} onOpenChange={(open) => {
            setIsExpenseOpen(open)
            if (!open) {
              setActiveTab('manual')
              setSmsText('')
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex-1 h-12 sm:h-11" size="lg">
                <Plus className="mr-2" weight="bold" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'sms')} className="pt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="sms">
                    <ChatCircleText className="mr-1.5" weight="fill" size={16} />
                    From SMS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sms" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-text">Paste Transaction SMS</Label>
                    <Textarea
                      id="sms-text"
                      placeholder="Paste your bank SMS here, e.g., 'Rs.1,250 spent at Amazon on Card ending 1234'"
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      rows={6}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleParseSMS} className="flex-1" size="lg">
                      Parse SMS
                    </Button>
                    {smsText && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setSmsText('')}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">How to use:</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Open your Messages app</li>
                      <li>Find the transaction SMS from your bank</li>
                      <li>Long-press the message and tap "Copy"</li>
                      <li>Return here and paste it in the box above</li>
                      <li>Tap "Parse SMS" to auto-fill the details</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports multiple formats and currencies (₹, Rs, $, €, £)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Button
                        type="button"
                        variant={expenseType === 'household' ? 'default' : 'outline'}
                        onClick={() => setExpenseType('household')}
                        className="h-auto py-3 sm:py-4"
                      >
                        <House className="mr-1.5 sm:mr-2" weight="fill" size={18} />
                        Household
                      </Button>
                      <Button
                        type="button"
                        variant={expenseType === 'personal' ? 'default' : 'outline'}
                        onClick={() => setExpenseType('personal')}
                        className="h-auto py-3 sm:py-4"
                      >
                        <User className="mr-1.5 sm:mr-2" weight="fill" size={18} />
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
                      className="text-base"
                      inputMode="decimal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-description">Description</Label>
                    <Input
                      id="expense-description"
                      placeholder="What was this for?"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="text-base"
                    />
                  </div>

                  <Button onClick={handleAddExpense} className="w-full" size="lg">
                    Add Expense
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-12 sm:h-11" size="lg">
                <ArrowDown className="mr-2" weight="fill" />
                Add Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
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
                    className="text-base"
                    inputMode="decimal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-note">Note (optional)</Label>
                  <Input
                    id="deposit-note"
                    placeholder="Add a note"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    className="text-base"
                  />
                </div>

                <Button onClick={handleAddDeposit} className="w-full" size="lg">
                  Record Deposit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="my-4 sm:my-6" />

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Transaction History</h2>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <Funnel className="mr-1.5 sm:mr-2" size={16} />
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
            <Card className="p-8 sm:p-12">
              <div className="text-center space-y-2">
                <p className="text-base sm:text-lg font-medium text-muted-foreground">No transactions yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Add an expense or deposit to get started</p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="h-[400px] sm:h-[500px] rounded-md border">
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <AnimatePresence initial={false}>
                  {filteredTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`p-3 sm:p-4 border-l-4 ${
                        transaction.type === 'household' ? 'border-l-destructive' :
                        transaction.type === 'personal' ? 'border-l-primary' :
                        'border-l-accent'
                      }`}>
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {transaction.type === 'household' && (
                                <House className="text-destructive shrink-0" weight="fill" size={16} />
                              )}
                              {transaction.type === 'personal' && (
                                <User className="text-primary shrink-0" weight="fill" size={16} />
                              )}
                              {transaction.type === 'deposit' && (
                                <ArrowDown className="text-accent shrink-0" weight="fill" size={16} />
                              )}
                              <Badge variant={
                                transaction.type === 'household' ? 'destructive' :
                                transaction.type === 'deposit' ? 'default' :
                                'secondary'
                              } className="text-xs">
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                            <p className={`text-base sm:text-lg font-bold tabular-nums ${
                              transaction.type === 'deposit' ? 'text-accent' : 'text-foreground'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : ''}{formatCurrency(transaction.amount)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(transaction.id)}
                              className="text-muted-foreground hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Trash size={18} />
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
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0">Cancel</AlertDialogCancel>
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
