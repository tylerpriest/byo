import pino from 'pino'

const isDevelopment = import.meta.env.DEV

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  browser: {
    asObject: true,
  },
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})

export default logger
