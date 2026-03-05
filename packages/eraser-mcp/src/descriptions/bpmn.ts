export const BPMN_DESCRIPTION = `Render a BPMN (Business Process Model and Notation) diagram. Use Eraser's BPMN syntax.

Example syntax:
\`\`\`
title Order Fulfillment Process

// Swimlanes (pools)
Customer [color: blue] {
  Place Order [type: event, icon: shopping-cart]
  Receive Confirmation [type: event, icon: mail]
  Receive Package [type: event, icon: package]
}

Sales [color: green] {
  Process Order [icon: clipboard]
  Check Inventory [icon: database]
  In Stock? [type: gateway, icon: help-circle]
  Create Backorder [icon: clock]
  Confirm Order [icon: check]
}

Warehouse [color: orange] {
  Pick Items [icon: box]
  Pack Order [icon: package]
  Ship Order [icon: truck]
}

// Flow connections (use --> for message flows between pools)
Place Order --> Process Order: Order details
Process Order > Check Inventory
Check Inventory > In Stock?
In Stock? > Confirm Order: Yes
In Stock? > Create Backorder: No
Confirm Order --> Receive Confirmation: Confirmation email
Confirm Order > Pick Items
Pick Items > Pack Order
Pack Order > Ship Order
Ship Order --> Receive Package: Delivery
\`\`\``;
