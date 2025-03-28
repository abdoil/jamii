export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Customer Places Order",
      description: "Browse products, add to cart, and place an order with HBAR payment via Hedera wallet.",
    },
    {
      number: "02",
      title: "Store Owner Confirms",
      description: "Store owner receives the order, confirms availability, and prepares the items for delivery.",
    },
    {
      number: "03",
      title: "Delivery Agents Bid",
      description: "Delivery agents view available jobs and place competitive bids to deliver the order.",
    },
    {
      number: "04",
      title: "Delivery Assigned",
      description: "The store owner selects a delivery agent based on ratings, price, and estimated delivery time.",
    },
    {
      number: "05",
      title: "Order Delivered",
      description: "The delivery agent picks up the order and delivers it to the customer's location.",
    },
    {
      number: "06",
      title: "Payment Released",
      description:
        "Upon confirmation of delivery, the smart contract releases payment to the store and delivery agent.",
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our decentralized logistics platform connects customers, stores, and delivery agents in a transparent and
              secure way.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-start space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

