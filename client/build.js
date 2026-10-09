import { build } from 'vite'

try {
  await build()
  console.info('Client production build completed successfully.')
} catch (error) {
  console.error('VITE PRODUCTION BUILD FAILED:')
  console.error(error?.stack || error)
  process.exit(1)
}
