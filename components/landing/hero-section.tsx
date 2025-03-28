import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Decentralized Logistics Platform
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A transparent, secure, and efficient way to connect customers, stores, and delivery agents using
                blockchain technology.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-70 blur-3xl" />
              <div className="absolute inset-4 bg-white dark:bg-black rounded-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Powered by</h3>
                  <p className="text-xl mt-2">Hedera Hashgraph</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

