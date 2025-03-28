"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Star } from "lucide-react"

interface ReviewFormProps {
  orderId: string
  type: "store" | "delivery"
}

export function ReviewForm({ orderId, type }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically send the review data to your API
    // For now, we'll just show a success message
    toast({
      title: "Review submitted",
      description: `Thank you for your ${rating}-star review!`,
    })

    // Reset form after submission
    setRating(0)
    setComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Rate your {type} experience:</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Your comment:
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Tell us about your ${type} experience...`}
          rows={4}
        />
      </div>
      <Button type="submit" disabled={rating === 0}>
        Submit Review
      </Button>
    </form>
  )
}

