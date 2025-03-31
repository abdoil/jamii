// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeliveryEscrow {
    struct Order {
        address customer;
        uint256 amount;
        address deliveryAgent;
        uint256 bidAmount;
        bool delivered;
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    event OrderPlaced(uint256 orderId, address customer, uint256 amount);
    event BidPlaced(uint256 orderId, address agent, uint256 bid);
    event DeliveryConfirmed(uint256 orderId, address agent, uint256 payment);

    // Add receive function to handle incoming HBAR
    receive() external payable {}

    function placeOrder() external payable {
        require(msg.value > 0, "Must send HBAR for payment");
        
        orderCount++;
        orders[orderCount] = Order({
            customer: msg.sender,
            amount: msg.value,
            deliveryAgent: address(0),
            bidAmount: 0,
            delivered: false
        });

        emit OrderPlaced(orderCount, msg.sender, msg.value);
    }

    function placeBid(uint256 orderId, uint256 bidAmount) external {
        require(orders[orderId].customer != address(0), "Order not found");
        require(orders[orderId].deliveryAgent == address(0), "Order already assigned");
        require(bidAmount > 0, "Bid amount must be greater than 0");
        
        orders[orderId].deliveryAgent = msg.sender;
        orders[orderId].bidAmount = bidAmount;

        emit BidPlaced(orderId, msg.sender, bidAmount);
    }

    function confirmDelivery(uint256 orderId) external {
        Order storage order = orders[orderId];

        require(msg.sender == order.customer, "Only customer can confirm delivery");
        require(order.deliveryAgent != address(0), "No delivery agent assigned");
        require(!order.delivered, "Order already delivered");

        order.delivered = true;
        
        // Pay the delivery agent their bid amount
        (bool success, ) = payable(order.deliveryAgent).call{value: order.bidAmount}("");
        require(success, "Transfer to delivery agent failed");

        // Pay the remaining amount back to the customer
        (success, ) = payable(order.customer).call{value: order.amount - order.bidAmount}("");
        require(success, "Transfer to customer failed");

        emit DeliveryConfirmed(orderId, order.deliveryAgent, order.bidAmount);
    }
} 