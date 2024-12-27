import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SafetyService {

    isAnalysingSubject = new BehaviorSubject<boolean>(false);

    showSafety(){
        this.isAnalysingSubject.next(true);
    }

    hideSafety(){
        this.isAnalysingSubject.next(false);
    }

}