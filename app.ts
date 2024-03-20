import { config } from "dotenv"
config()
import rootAdminRouter from "./src/v1/routes/admin/rootAdmin.router.js"
import rootCustomerRouter from "./src/v1/routes/customer/rootCustomer.router.js"
import app from "./src/v1/setup/server.setup.js"
import { expressErrorHandler } from "./src/utils/errorHandling.utils.js"
import { populateAdminInRequest, populateCustomerInRequest } from "./src/v1/middlewares/popuateUsers.middleware.js"

app.use((req, res, next) => {
  const { hostname, originalUrl, protocol, method } = req

  // Create a new Date object
  const currentDate = new Date()

  // Extract the hours, minutes, and seconds from the Date object
  const hours = currentDate.getHours()
  const minutes = currentDate.getMinutes()
  const seconds = currentDate.getSeconds()

  // Format the time values to have two digits if they are less than 10
  const formattedHours = hours < 10 ? `0${hours}` : hours
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds

  // Create the formatted time string
  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`

  console.log(
    `${method.toUpperCase()} Request : [${formattedTime}]  `,
    `${protocol}://${hostname}:${process.env.PORT!}${originalUrl}`
  )
  next()
})
//
app.use("/admin/v1", populateAdminInRequest, rootAdminRouter)
app.use("/api/v1", populateCustomerInRequest, rootCustomerRouter)
app.use("", (req, res) => {
  return res.send(
    `
	<h1 style="text-align:center"> ✅ QP-ASSESSMENT :: RUNNING 🏃‍♂️🏃‍♀️ </h1>
	`
  )
})

app.use(expressErrorHandler)
