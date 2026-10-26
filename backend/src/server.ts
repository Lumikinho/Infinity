import 'dotenv/config'
import express from 'express'

import router from './routes/routes'

const app = express()

const PORT = process.env.SERVER_PORT

app.use(express.json())
app.use('/api', router)

app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`)
})
