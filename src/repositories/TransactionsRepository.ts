import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface TransactionTDO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transaction = await this.find();

    const income = transaction.reduce((previous, current) => {
      if (current.type === 'income') {
        return previous + Number(current.value);
      }
      return previous;
    }, 0);

    const outcome = transaction.reduce((previous, current) => {
      if (current.type === 'outcome') {
        return previous + Number(current.value);
      }
      return previous;
    }, 0);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
