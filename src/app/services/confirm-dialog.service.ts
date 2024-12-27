import { Injectable } from "@angular/core";
import { BehaviorSubject, filter } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ConfirmDialogService{

    isOpenSubject = new BehaviorSubject<boolean>(false);
    isConfirmedSubject = new BehaviorSubject<boolean | null>(null);
    isConfirmedValue$ = this.isConfirmedSubject.asObservable();

    openDialog(){
        this.isOpenSubject.next(true);
        this.isConfirmedSubject.next(null);
        return this.isConfirmedValue$.pipe(filter((value) => value !== null));
    }

    cancel(){
        this.isOpenSubject.next(false);
        this.isConfirmedSubject.next(false);
    }

    isConfirmed(){
        this.isConfirmedSubject.next(true);
        this.isOpenSubject.next(false);
    }


}