import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { Angular4PaystackModule } from "angular4-paystack";
import { IonicModule } from "@ionic/angular";

import { MakePaymentPageRoutingModule } from "./make-payment-routing.module";

import { MakePaymentPage } from "./make-payment.page";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MakePaymentPageRoutingModule,
        Angular4PaystackModule.forRoot(
            "pk_test_0217c6812b7c2b0a387fbe032ec97ef3b8114c61"
        ),
    ],
    declarations: [MakePaymentPage],
})
export class MakePaymentPageModule {}
