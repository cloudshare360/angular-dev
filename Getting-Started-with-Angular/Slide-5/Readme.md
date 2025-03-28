Working with Templates
35 min
We’ll now focus on using templates to display and manage data within our components dynamically.

Angular templates are crucial for defining how application data is rendered in the user interface. They combine standard HTML with Angular-specific markers and data bindings to dynamically display and manipulate content.

To manage the dynamic display of content, we use built-in control-flow structures such as @if, @for, and @switch directly in our HTML files.

The @if control-flow structure conditionally includes HTML blocks based on boolean expressions, enabling dynamic content display:
```
@if (a > b) {
  {{a}} is greater than {{b}}
} @else if (b > a) {
  {{a}} is less than {{b}}
} @else {
  {{a}} is equal to {{b}}
}
```

The @for control-flow structure iterates over 
Preview: Docs Loading link description
arrays
 to generate repeated elements:
```
@for (item of items; track item.name) {
  <li>{{ item.name }}</li>
} @empty {
  <li>There are no items.</li>
}
```

In the @for loop, we use a track expression to assign a unique identifier. This helps Angular efficiently track and update each item in the array, optimizing rendering.

The @switch control-flow structure displays elements based on the value of an expression and manages multiple conditions:
```
@switch (condition) {
  @case (caseA) {
    Case A.
  }
  @case (caseB) {
    Case B.
  }
  @default {
    Default case.
  }
}
```

In Angular, we can also use template variables to store references to DOM elements within the template, making it easier to access and manipulate these elements. To make a template variable, use the # symbol and a unique name within the element tag.
```
<input #userInput type="text" placeholder="Enter your name" value="Codey">
<h2>{{ userInput.value }}</h2>
```

In this example, the #userInput template variable captures the input element, allowing us to access its value, Codey.

Now, we’ll start dynamically rendering the menu items for the restaurant.

In restaurant-menu.component.html, locate the <main> element and add a control-flow structure inside to iterate over the dishes array. Make sure to use track to uniquely identify each dish.

Checkpoint 2 Passed
2.
Create a <div> with the class dish within the loop.

Checkpoint 3 Passed
3.
Within this <div>, use interpolation to display each dish’s name inside an <h3> tag.

Checkpoint 4 Passed
4.
Below the dish name, use interpolation to display each dish’s description within a <p> tag.

Checkpoint 5 Passed
5.
Below the dish description, use property binding to display each dish’s image URL within an <img> tag. Set the image width and height to 200.

Checkpoint 6 Passed
6.
Add a template variable named menuElement to the <main> element within the template.

Checkpoint 7 Passed
7.
Inside the <div> with the class menu-items, use a control-flow structure to conditionally display the value of menuElement if it exists.

Use .length on the dishes array to count the number of dishes on the menu and display this count within a <span> tag.

Use the following format for the text: “Today’s menu has X dishes.”