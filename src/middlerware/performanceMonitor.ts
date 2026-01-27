interface PerformanceMetric {
  name: string
  duration: number
  timestamp: Date
  metadata?: any
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = []
  private static startTimes: Map<string, number> = new Map()

  static startMeasure(name: string): void {
    this.startTimes.set(name, performance.now())
  }

  static endMeasure(name: string, metadata?: any): void {
    const startTime = this.startTimes.get(name)
    if (startTime) {
      const duration = performance.now() - startTime

      this.metrics.push({
        name,
        duration,
        timestamp: new Date(),
        metadata
      })

      this.startTimes.delete(name)

      // Log si performance dégradée
      if (duration > 1000) {
        console.warn(`⚠️ Performance: ${name} took ${Math.round(duration)}ms`, metadata)
      }

      // Garder seulement les 50 dernières métriques
      if (this.metrics.length > 50) {
        this.metrics = this.metrics.slice(-50)
      }
    }
  }

  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  static getAverageTime(operationName: string): number {
    const operations = this.metrics.filter(m => m.name === operationName)
    if (operations.length === 0) return 0

    return operations.reduce((sum, op) => sum + op.duration, 0) / operations.length
  }

  static getSlowestOperations(limit: number = 5): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }
}

// Usage dans les stores
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    PerformanceMonitor.startMeasure(operationName)

    try {
      const result = await fn(...args)
      PerformanceMonitor.endMeasure(operationName, { success: true })
      return result
    } catch (error) {
      PerformanceMonitor.endMeasure(operationName, { success: false, error: error.message })
      throw error
    }
  }) as T
}
