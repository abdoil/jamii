import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";

interface TransactionHistoryProps {
  transactions: {
    orderPlaced: {
      amount: number;
      timestamp: string;
      transactionId: string;
    };
    bidPlaced?: {
      amount: number;
      timestamp: string;
      transactionId: string;
      deliveryAgentId: string;
    };
    deliveryConfirmed?: {
      amount: number;
      timestamp: string;
      transactionId: string;
      deliveryAgentId: string;
    };
  };
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Placed Transaction */}
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(transactions.orderPlaced.timestamp),
                      "PPp"
                    )}
                  </p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  {transactions.orderPlaced.amount} HBAR
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Transaction ID: {transactions.orderPlaced.transactionId}
              </p>
            </div>
          </div>

          {/* Bid Placed Transaction */}
          {transactions.bidPlaced && (
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-500/10 p-2">
                <ArrowDownLeft className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bid Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(transactions.bidPlaced.timestamp),
                        "PPp"
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10">
                    {transactions.bidPlaced.amount} HBAR
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Transaction ID: {transactions.bidPlaced.transactionId}
                </p>
              </div>
            </div>
          )}

          {/* Delivery Confirmed Transaction */}
          {transactions.deliveryConfirmed && (
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delivery Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(transactions.deliveryConfirmed.timestamp),
                        "PPp"
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10">
                    {transactions.deliveryConfirmed.amount} HBAR
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Transaction ID: {transactions.deliveryConfirmed.transactionId}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
