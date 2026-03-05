export const ERD_DESCRIPTION = `Render an entity-relationship diagram. Use Eraser's ERD syntax.

Example syntax:
\`\`\`
title E-commerce Database

// Define tables with columns
users [icon: user, color: blue] {
  id int pk
  email string
  name string
  created_at timestamp
}

orders [icon: shopping-cart, color: green] {
  id int pk
  user_id int
  total decimal
  status string
  created_at timestamp
}

products [icon: box, color: orange] {
  id int pk
  name string
  price decimal
  stock int
}

order_items [icon: list] {
  order_id int pk
  product_id int pk
  quantity int
  price decimal
}

// Relationships
users.id < orders.user_id
orders.id < order_items.order_id
products.id < order_items.product_id
\`\`\``;
