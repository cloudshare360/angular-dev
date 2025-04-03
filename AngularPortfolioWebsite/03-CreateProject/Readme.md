# Create angular website
@@ Command to install angular cli 15 at system level
```
npm install -g @angular/cli@15
```
Check the angular cli version
```
ng version
```
![alt text](image.png)
name of the prject would be angular-portfolio-website
to keep simple, I am creating as angular-portfolio-app
```
ng new angular-portfolio-app
```
![alt text](image-1.png)

Once you create the app. navigate to the folder, one will find the index.html

angular-portfolop-app
AngularPortfolioWebsite/03-CreateProject/angular-portfolio-app/src/index.html

![alt text](image-2.png)


![alt text](image-3.png)

Angular App Component - html - containing , css, html content.
when angular app is opened, this is the content once view on angular app.
![alt text](image-4.png)

To Start the angular project
```
ng server
```
![alt text](image-5.png)
Now delete the content in app.component.html ( AngularPortfolioWebsite/03-CreateProject/angular-portfolio-app/src/app/app.component.html)
Add h1 tag which contains HelloWorld!
Next is the angular components 
![]
](image-6.png)
Angular Portfolio website has multiple components
Header
Nav Bar Component
and When you click on each tab, it is a component.
![alt text](image-7.png)
Title Component in TS file
![alt text](image-8.png)
Adding Title Variable from Ts Component to Component's Html using Decorator
![alt text](image-9.png)
Visiting site Back
![alt text](image-10.png)
The last part of the component is selector
![alt text](image-11.png)
select is app-root which is refered in index.html
![alt text](image-12.png)
App Module
App Module contains Declarations and Imports
These are the two sections one has to modify when a new components are added.
The last part is the angular.json
![alt text](image-13.png)