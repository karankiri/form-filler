import { useState } from "react"
import { Input } from "@/components/ui/input"
import "./global.css"
import App from "~@/components/Form"

function IndexPopup() {
  const [data, setData] = useState("Hello")

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <App />
    </div>
  )
}

export default IndexPopup
