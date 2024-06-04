import { useState } from "react"
import "../global.css"
import App from "~@/components/Form"

function IndexPopup() {
  const [data, setData] = useState("Hello")

  return (
    <App />
  )
}

export default IndexPopup
