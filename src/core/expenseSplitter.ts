export interface Expense {
  user: string; // identificador de la persona
  amount: number; // gasto realizado por esa persona
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

/**
 * Calcula las transferencias necesarias para equilibrar los gastos entre todos los usuarios.
 * @param users Lista de todos los participantes (n).
 * @param expenses Lista de gastos realizados (m <= n).
 * @returns Lista de transferencias (quién paga a quién y cuánto).
 */
export function splitExpenses(users: string[], expenses: Expense[]): Transfer[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fairShare = total / users.length;

  // Mapear lo que pagó cada usuario
  const paid: Record<string, number> = {};
  users.forEach((u) => (paid[u] = 0));
  expenses.forEach((e) => (paid[e.user] += e.amount));

  // Calcular saldo (positivo si debe recibir, negativo si debe pagar)
  const balances = users.map((u) => ({
    user: u,
    balance: paid[u] - fairShare,
  }));

  // Separar deudores y acreedores
  const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b }));
  const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));

  const transfers: Transfer[] = [];

  // Algoritmo greedy: cada deudor paga hasta saldar su deuda
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.01) {
      // evitar decimales muy pequeños
      transfers.push({
        from: debtor.user,
        to: creditor.user,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return transfers;
}
