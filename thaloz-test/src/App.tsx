import { useState, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs';
import sweetalert2 from 'sweetalert2'

import './App.css'

type Transaction = {
  id: string,
  amount: number,
  date: Dayjs
}

const mockedTransactions: Transaction[] = [
  {
    id: crypto.randomUUID(),
    amount: 1000,
    date: dayjs().add(100, 'days')
  },
  {
    id: crypto.randomUUID(),
    amount: 500,
    date: dayjs().add(150, 'days')
  },
  {
    id: crypto.randomUUID(),
    amount: 500,
    date: dayjs().add(80, 'days')
  },
  {
    id: crypto.randomUUID(),
    amount: 1200,
    date: dayjs().add(20, 'days')
  },
  {
    id: crypto.randomUUID(),
    amount: 1100,
    date: dayjs().add(300, 'days')
  },
]

const fetchTransactions = () => new Promise<Transaction[]>((resolve) => {
  resolve(mockedTransactions);
})

const TransactionList = ({ transactions }) => transactions.map(({ id, amount, date }) => (
  <>
    <h3>Transaction ID: {id.substr(0, 8)}</h3>
    <p>Amount: {amount}</p>
    <p>Date: {date.format('DD/MM/YYYY')}</p>    
  </>
))

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [matchingTransactions, setMatchingTransactions] = useState<{ idx: number}>(null)
  const [amount, setAmount] = useState<number>(0)
  const [fromDate, setFromDate] = useState<Dayjs>(null)
  const [toDate, setToDate] = useState<Dayjs>(null)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const transactions = await fetchTransactions();
        setTransactions(transactions);
      } catch (error) {
        console.error(error)
      }
    }

    loadTransactions();
  }, [])

  const checkTransactionsForTarget = () => {
    const seenTransactions = new Map<number, number>
    let found = false

    transactions.forEach((transaction, index) => {
      const complement = targetAmount - transaction.amount

      if (seenTransactions.has(complement)) {
        setMatchingTransactions({ idx: [seenTransactions.get(complement), index]})
        found = true
      }

      seenTransactions.set(transaction.amount, index)
    })

    if (!found) {
      sweetalert2.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No matching transactions found',
      })
      setMatchingTransactions(null); 
    }
  }

  const handleAmountChange = ({ target: { value }}) => {
    setTargetAmount(value)
  }

  const onCreateTransaction = () => {
    if (!amount) {
      sweetalert2.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter an amount',
      })
      return
    }

    setTransactions([
      {
        id: crypto.randomUUID(),
        amount,
        date: dayjs()
      },
      ...transactions
    ])
  }
  
  const onSetAmount = ({ target: { value }}) => {
    setAmount(value);
  }

  const handleFilterByDate = () => {
    if (toDate < fromDate) {  
      sweetalert2.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'End date could not be earlier than start date',
      })
      
      return 
    }
  
    if (fromDate && toDate) {
      const filteredTransactions = mockedTransactions.filter(
        ({ date }) => date.isBefore(toDate) && date.isAfter(fromDate)
      )

      setTransactions(filteredTransactions)
    } else {
      sweetalert2.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select a date range',
      })
    }
  }

  const handleClearDate = () => {
    setFromDate(null)
    setToDate(null)
    setTransactions(mockedTransactions);
  }
  const handleDateChange = ({ isFrom, value }: { isFrom: boolean, value: string }) => {  
    if (isFrom) {
      setFromDate(dayjs(value))
    } else {
      setToDate(dayjs(value))
    }
  }

  return (
    <>
      <div>
        <input type="date" onChange={({ target: { value }}) => handleDateChange({ isFrom: true, value})} />
        <input type="date" onChange={({ target: { value }}) => handleDateChange({ isFrom: false, value})} />
        <button onClick={handleFilterByDate}>Filter by date</button>
        <button onClick={handleClearDate}>Clear date</button>
      </div>

      <div>
        <input type='number' onChange={onSetAmount} placeholder='amount' />
        <button onClick={onCreateTransaction}>Add Transaction</button>
      </div>

      {
        transactions.length > 0 ? 
          <TransactionList transactions={transactions} /> :
          <p>No transactions found</p>
      }

      <div>
        <input placeholder='amount' onChange={handleAmountChange} />
        <button onClick={checkTransactionsForTarget}>Check Transactions</button>  
      </div>

      { 
        matchingTransactions &&
        <p>
          Matching transactions: 
          {transactions[matchingTransactions.idx[0]].id} and 
          {transactions[matchingTransactions.idx[1]].id}
        </p>
      }
    </>
  )
}

export default App
