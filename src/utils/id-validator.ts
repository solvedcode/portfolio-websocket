export function validateId(id: any): number | null {
  const num = Number(id)

  if (isNaN(num)) {
    // throw new Error('ID must be a number')
    return null
  }

  if (num < 0) {
    // throw new Error('ID must be a positive number')
    return null
  }

  if (!Number.isInteger(num)) {
    // throw new Error('ID must be an integer')
    return null
  }

  return num
}
