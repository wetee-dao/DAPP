export function debounce<T extends Function>(func: T, timeout: number): T {
  let timer: NodeJS.Timeout;

  return ((...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  }) as any;
}