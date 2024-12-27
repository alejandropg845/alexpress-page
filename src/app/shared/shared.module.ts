import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { CategoriesSliderComponent } from '../pages/categories-slider/categories-slider.component';



@NgModule({
  declarations: [FooterComponent, 
                 HeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports:[HeaderComponent,
          FooterComponent
  ]
})
export class SharedModule { }
