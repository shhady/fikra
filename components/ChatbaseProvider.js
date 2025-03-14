'use client'
import { useEffect } from 'react'

export default function ChatbaseProvider({ user }) {
  useEffect(() => {
    // Chatbase initialization script
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) {
          window.chatbase.q = []
        }
        window.chatbase.q.push(args)
      }
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q
          }
          return (...params) => target(prop, ...params)
        }
      })
    }

    const initChatbase = async () => {
      // Load Chatbase 
      const script = document.createElement("script")
      script.src = "https://www.chatbase.co/embed.min.js"
      script.id = "JWCTDqGF6GHId3GzMS-wQ"
      script.async = true
      script.defer = true
      document.body.appendChild(script)

      // If user is logged in, get verification signature
      if (user) {
        try {
          const response = await fetch('/api/chatbase-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
            }),
          })
          
          const { signature } = await response.json()
          
          window.chatbase('identify', {
            userId: user.id,
            userEmail: user.email,
            signature,
          })
        } catch (error) {
          console.error('Chatbase identification error:', error)
        }
      }
    }

    initChatbase()

    return () => {
      // Cleanup if needed
      const existingScript = document.getElementById("JWCTDqGF6GHId3GzMS-wQ")
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [user])

  return null
} 