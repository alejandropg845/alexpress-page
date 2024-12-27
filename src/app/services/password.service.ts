import { Injectable } from "@angular/core";
import { BehaviorSubject, filter } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PasswordService{

    showDialog = new BehaviorSubject<boolean>(false);
    value = new BehaviorSubject<string>("");
    private value$ = this.value.asObservable();

    openDialog(){
        this.showDialog.next(true);
        this.value.next("");
        return this.value$.pipe(filter((value) => value !== ""));
    }

    onSubmitPassword(value:string){

        if(!value) return;

        this.value.next(value);
        this.showDialog.next(false);
    }

}