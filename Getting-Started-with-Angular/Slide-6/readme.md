Composing UI Elements
27 min
Now, let’s explore how to compose and manage complex UI structures in Angular.

Component composition in Angular involves importing one component into another to build nested structures. For instance, if MenuComponent needs to use MenuItemComponent, you can import it directly using the imports metadata of the @Component decorator. Note that both components need to be standalone to use this.

import { MenuItemComponent } from './menu-item.component'; // Import the component via path

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MenuItemComponent], // Declare MenuItemComponent as a dependency in the imports array
  template: `<app-menu-item></app-menu-item>`, // Use the MenuItemComponent in the template construction
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  dishes = [...];  // Array of dish names or objects
}


In this example, MenuItemComponent is imported into MenuComponent, allowing the use of the selector <app-menu-item> within its template.

Content projection is another powerful feature that enables a parent component to project content into a child component. Meaning— a child component can be more generic and display content passed in by a parent component.

There are two types of content projection: single-slot and multi-slot.

For single-slot content projection, place an <ng-content> tag within the child component template. This tag acts as a placeholder for content provided by the parent component.

To use it, place a <ng-content> tag in the child component like so:

<!-- menu-item.component.html, <app-menu-item> tag -->
<div class="menu-item">
  <ng-content></ng-content>
</div>


In the parent component, you can project content into this slot as follows:

<!-- menu.component.html -->
<app-menu-item>
  <p>Projected Content</p>
</app-menu-item>


The resulting rendered DOM is:

<div class="menu-item">
  <p>Projected Content</p>
</div>


For multi-slot content projection, use multiple <ng-content> tags with select attributes to project content into designated slots based on CSS selectors.

<!-- complex-menu.component.html -->
<div class="menu-header">
  <ng-content select=".headerContent"></ng-content> <!-- Assign class selector for the first slot -->
</div>
<div class="menu-body">
  <ng-content select=".bodyContent"></ng-content> <!-- Assign class selector for the second slot -->
</div>


Here’s how you can use this multi-slot projection from a parent component:

<!-- menu.component.html -->
<app-menu-item>
  <div class="headerContent">Header Content</div> <!--  Assign relevant class names for the first slot -->
  <div class="bodyContent">Body Content</div> <!--  Assign relevant class names for the second slot -->
</app-menu-item>


We can also create a fallback element with content project. The fallback element can be nestled between the <ng-content> tags; if nothing is projected, the fallback element will be displayed.
```
<!-- menu-item.component.html, <app-menu-item> tag -->
<div class="menu-item">
  <ng-content>
    <p>This is the fallback, default content</p>
  </ng-content>
</div>
```