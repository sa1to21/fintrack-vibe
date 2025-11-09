/**
 * Normalizes number input by replacing comma with dot
 * This allows users to enter decimal numbers using either comma or dot as separator
 *
 * @param value - The input value from user
 * @returns Normalized value with comma replaced by dot
 *
 * @example
 * normalizeNumberInput("123,45") // returns "123.45"
 * normalizeNumberInput("123.45") // returns "123.45"
 * normalizeNumberInput("123") // returns "123"
 */
export function normalizeNumberInput(value: string): string {
  return value.replace(',', '.');
}

/**
 * Handler for onChange event that normalizes number input
 * Use this with input onChange to automatically replace commas with dots
 *
 * @param setter - State setter function from useState
 * @returns onChange handler function
 *
 * @example
 * const [amount, setAmount] = useState('');
 * <Input onChange={handleNumberInput(setAmount)} value={amount} />
 */
export function handleNumberInput(setter: (value: string) => void) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(normalizeNumberInput(e.target.value));
  };
}
