import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './modules/material'

class MyErrorHandler implements ErrorHandler {
    handleError(error) {
        chrome.runtime.sendMessage({
            action: 'error_notification',
            error: error.toString()
        })
    }
}
@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, MaterialModule],
    bootstrap: [AppComponent],
    providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
})
export class AppModule {
}
