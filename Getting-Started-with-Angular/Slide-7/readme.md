Angular Introduction
Images in Components
11 min
Efficient image handling is crucial for performance and user experience in web applications. To optimize loading times and resource usage, Angular provides the NgOptimizedImage directive. A directive is a class that attaches specific behavior to elements in the template.

The NgOptimizedImage directive automatically optimizes images for different screen sizes and conditions, improving load times and resource efficiency. Here’s how to integrate it into your Angular components.

First, import the NgOptimizedImage directive:

import { NgOptimizedImage } from '@angular/common';


Then, add it to the imports array:

@Component({
  selector: 'app-image-display',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './image-display.component.html',
  styleUrl: './image-display.component.css'
})
export class ImageDisplayComponent {
  imageUrl = 'path/to/image.jpg';
}


In this example, the NgOptimizedImage directive is imported into the ImageDisplayComponent, making it available for use in the component’s template.

Next, use the ngSrc attribute to dynamically bind image sources within the template. This ensures that the image path can be reactive and change based on the component’s data. We must specify width and height for the image or use the fill attribute to have the image fill the containing element.
```
<!-- Dynamically binding an image source in Angular -->
<img [ngSrc]="user.profilePictureUrl" width="200" height="200" alt="User Profile Picture">
```

The ngSrc attribute works similarly to the standard src attribute but with additional optimizations.

Additionally, you can use the placeholder attribute with NgOptimizedImage to display a temporary image while the main image loads. This enhances the user experience by providing immediate feedback.
```
<!-- Using placeholder attribute with ngOptimizedImage -->
<img [ngSrc]="product.imageUrl" width="400" height="200" placeholder alt="Product Image">
```

In this example, a placeholder image is shown while the main product.imageUrl is loading. The placeholder attribute can also be a URL to a low-resolution image or a base64-encoded image, providing a smoother visual transition.

