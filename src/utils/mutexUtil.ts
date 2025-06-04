class EfficientMutexManager {
  private locks: Map<string, Promise<void>> = new Map();
  
  private getMutexKey(name: string, args: Array<string>): string {
    return `${name}:${args.join(',')}`;
  }
  
  async runWithMutex<T>(
    name: string,
    args: Array<string>,
    block: () => Promise<T>
  ): Promise<T> {
    const mutexKey = this.getMutexKey(name, args);
    
    // Ждем, пока текущая блокировка не будет снята
    while (this.locks.has(mutexKey)) {
      await this.locks.get(mutexKey);
    }
    
    // Создаем новый Promise для этой блокировки
    let releaseLock: () => void;
    const lockPromise = new Promise<void>(resolve => {
      releaseLock = resolve;
    });
    
    // Устанавливаем блокировку
    this.locks.set(mutexKey, lockPromise);
    
    try {
      // Выполняем блок кода
      const result = await block();
      return result;
    } finally {
      // Освобождаем блокировку
      this.locks.delete(mutexKey);
      releaseLock!();
    }
  }
}

export const mutexManager = new EfficientMutexManager()