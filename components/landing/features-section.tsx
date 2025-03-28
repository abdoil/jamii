import { ShoppingCart, Package, Truck, Shield, Coins, Clock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <ShoppingCart className="h-10 w-10 text-primary" />,
      title: "Easy Shopping",
      description: "Browse products and place orders with a seamless shopping experience.",
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "Order Tracking",
      description: "Track your orders in real-time from placement to delivery.",
    },
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Delivery Bidding",
      description: "Delivery agents can bid on available jobs for competitive pricing.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure Payments",
      description: "Payments are secured through Hedera smart contracts with escrow protection.",
    },
    {
      icon: <Coins className="h-10 w-10 text-primary" />,
      title: "HBAR Payments",
      description: "Use HBAR cryptocurrency for all transactions on the platform.",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Real-time Updates",
      description: "Get instant notifications about your orders and deliveries.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Platform Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform offers a range of features to make logistics simple, transparent, and secure.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              {feature.icon}
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

