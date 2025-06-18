export function validateId(id: any): number {
  const num = Number(id);

  if (isNaN(num)) {
    throw new Error("ID must be a number");
  }

  if (num < 0) {
    throw new Error("ID must be a positive number");
  }

  if (!Number.isInteger(num)) {
    throw new Error("ID must be an integer");
  }

  return num;
}
