import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Expense, splitExpenses, Transfer } from '../core/expenseSplitter.js';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, DatePipe, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('app-reparto-gastos');
  expenses: Expense[] = [];
  participants: string[] = [];
  participant: string = '';
  creditor: string = '';
  amount: number = 0;
  result: Transfer[] = [];
  showModal: boolean = false;
  expenseHistory: ExpenseStorageItem[] = [];

  closeExpenseHistory() {
    this.showModal = false;
  }

  showExpenseHistory() {
    const recordsJson = localStorage.getItem('app-reparto-gastos-operaciones');
    this.expenseHistory = recordsJson ? JSON.parse(recordsJson) : [];
    this.showModal = true;
  }

  saveExpense() {
    const existingRecordsJSON = localStorage.getItem('app-reparto-gastos-operaciones');

    const existingRecords: ExpenseStorageItem[] = existingRecordsJSON
      ? JSON.parse(existingRecordsJSON)
      : [];

    const lastId = existingRecords.length > 0 ? Math.max(...existingRecords.map((o) => o.id)) : -1;

    const newItem: ExpenseStorageItem = {
      id: lastId + 1,
      date: new Date(),
      expenses: this.expenses,
      participants: this.participants,
      transfers: this.result,
    };
    existingRecords.push(newItem);
    localStorage.setItem('app-reparto-gastos-operaciones', JSON.stringify(existingRecords));
    this.resetForms();
  }

  addParticipant(newParticipant: string) {
    if (!this.participants.includes(newParticipant) && newParticipant) {
      this.participants.push(newParticipant);
      this.participant = '';
    }
  }

  addExpense(participant: string, amount: number) {
    if (!this.participants.includes(participant)) {
      return;
    }

    if (Number(amount) <= 0) {
      return;
    }
    const newExpense: Expense = {
      amount: Number(amount),
      user: participant,
    };
    this.expenses.push(newExpense);
    this.amount = 0;
    this.creditor = '';
  }

  removeParticipant(participant: string) {
    if (
      this.participants.includes(participant) &&
      !this.expenses.find((g) => g.user == participant)
    ) {
      this.participants = this.participants.filter((x) => x !== participant);
    }
  }

  getResult() {
    const result = splitExpenses(this.participants, this.expenses);
    this.result = result;
  }

  resetForms() {
    this.amount = 0;
    this.creditor = '';
    this.expenses = [];
    this.participants = [];
    this.result = [];
  }
}

interface ExpenseStorageItem {
  id: number;
  date: Date;
  participants: string[];
  expenses: Expense[];
  transfers: Transfer[];
}
