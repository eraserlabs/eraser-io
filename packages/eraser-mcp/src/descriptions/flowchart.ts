export const FLOWCHART_DESCRIPTION = `Render a flowchart diagram. Use Eraser's flowchart syntax. Prefer horizontal layout (direction right) unless the user wants a vertical diagram.

Example syntax:
\`\`\`
title User Registration Flow
direction right

// Nodes with shapes and icons
Start [shape: oval, icon: play]
Enter Details [icon: edit]
Valid Email? [shape: diamond, icon: help-circle]
Send Verification [icon: mail]
Email Verified? [shape: diamond]
Create Account [icon: user-plus, color: green]
Show Error [icon: alert-triangle, color: red]
End [shape: oval, icon: check]

// Groups
Validation [color: blue] {
  Check Password Strength [icon: lock]
  Password OK? [shape: diamond]
}

// Connections with labels
Start > Enter Details
Enter Details > Valid Email?
Valid Email? > Send Verification: Yes
Valid Email? > Show Error: No
Send Verification > Email Verified?
Email Verified? > Create Account: Yes
Email Verified? > Show Error: No
Create Account > End
Show Error > Enter Details
\`\`\``;
