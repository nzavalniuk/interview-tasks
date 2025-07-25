export function isQueryValid(from: string, to: string, amount: string) {
  if (!from || !to || !amount) {
    return false;
  }

  const amountNumber = Number(amount);

  if (isNaN(amountNumber)) {
    return false;
  }

  return true;
}
