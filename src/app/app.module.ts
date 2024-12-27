import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';

import { SharedModule } from './shared/shared.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptorService } from './services/auth-interceptor.service';




@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    RouterOutlet,
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    SharedModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      progressAnimation: 'decreasing',
      progressBar: true,
      timeOut: 3000,
      preventDuplicates: true
    })
  ],
  providers: [{provide:HTTP_INTERCEPTORS, useClass:AuthInterceptorService, multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
