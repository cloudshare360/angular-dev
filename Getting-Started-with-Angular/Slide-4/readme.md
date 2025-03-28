Let’s turn our attention to data binding.

Data binding allows us to create dynamic and interactive applications by directly connecting the application data (model) to the user interface (view). It ensures that any changes in the data model are automatically reflected in the UI, eliminating the need for manual DOM manipulations.

We’ll focus on two types of data binding: interpolation and property binding.

Interpolation is the simplest form of data binding. It allows us to insert text values directly into the template. The syntax is {{ value }}, where value is a component property. This approach is useful for displaying dynamic data in the UI.
```
export class UserProfileComponent {
  userName = 'Rajesh Kumar';
}
```

```
<!-- Displaying a user's name using interpolation -->
<div>Hello, {{ userName }}!</div>
```

In this example, the userName property is defined in the TypeScript class and displayed in the template using interpolation. Interpolation allows for flexibility; you may also assign expressions for evaluation within the curly braces.

Property binding focuses on dynamically assigning values to the properties of HTML elements or directives. This involves a one-way data flow, where the data moves from the component’s property to the target element’s DOM property.

To bind to an element’s property, we can use square brackets [], which indicate our target property:
```
export class UserProfileComponent {
  user = { 
    profileImage: 'path/to/image.jpg' 
  };
}
```
```
<!-- Binding an image path dynamically -->
<img [src]="user.profileImage">
```

In this example, the user.profileImage property is evaluated as an expression and bound to the src attribute of the <img> tag. Since the data is one-way, updates in the component to user.profileImage would also update the src attribute (but updates to src will not update user.profileImage.)

Note that interpolation can also bind properties/attributes, but it’s mostly used for displaying text.
```
<img src="{{ user.profileImage }}">
```

In this case, the src attribute is set using interpolation, and the image is displayed based on the user.profileImage property.