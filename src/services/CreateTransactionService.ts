import { getRepository, getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';

interface TransactionTDO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionTDO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type invalid');
    }

    const { total } = await transactionRepository.getBalance();
    if (total < value && type === 'outcome') {
      throw new AppError('Insufficient funds');
    }

    const categoriesRepository = getRepository(Category);

    let checkCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      checkCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(checkCategory);
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category: checkCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
