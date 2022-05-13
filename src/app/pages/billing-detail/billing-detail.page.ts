import { Component, OnInit } from "@angular/core";
import { ModalController, NavController } from "@ionic/angular";
import { ApiService } from "src/app/api.service";
import { UtilService } from "src/app/util.service";
import { CancelOrderPage } from "../cancel-order/cancel-order.page";

@Component({
    selector: "app-billing-detail",
    templateUrl: "./billing-detail.page.html",
    styleUrls: ["./billing-detail.page.scss"],
})
export class BillingDetailPage implements OnInit {
    id: any;
    data: any = {};
    currency: string;
    address: any = "";
    addressId: any = "";

    date: any;
    totalBill = 0;
    payment: number;
    products: any = "";
    addressDiv: any = [];
    disPay: number;
    paymentType: string;

    constructor(
        private modal: ModalController,
        private api: ApiService,
        private util: UtilService
    ) {}

    makePay() {
        this.util.navCtrl.navigateForward("tabs/home/make-payment");
    }

    ngOnInit() {
        localStorage.getItem("date")
            ? (this.currency = localStorage.getItem("currency_symbol"))
            : this.util.navCtrl.navigateForward("tabs/home/cart");
    }
    ionViewWillEnter() {
        this.util.startLoad();
        this.id = localStorage.getItem("order-id");
        this.api.getDataWithToken("singleOrder/" + this.id).subscribe(
            (success: any) => {
                if (success.success) {
                    const updated = success.data.child.map((a) => {
                        a.service[0].total = a.service[0].price;
                        a.service[0].type = a.service[0].serviceName;
                        return a;
                    });
                    localStorage.setItem("orders", JSON.stringify([updated]));
                    localStorage.setItem(
                        "totalAmount",
                        JSON.stringify(success.data.payment)
                    );
                    this.data = success.data;
                    this.date = success.data.date;
                    this.payment = success.data.payment;
                    this.products = success.data.products;
                    this.totalBill = success.data.payment;
                    this.addressDiv = success.data.address.addr1;
                    this.addressId = success.data.addr_id;
                    this.paymentType = success.data.payment_type;
                    this.util.dismissLoader();
                }
            },
            (err) => {
                this.util.dismissLoader();
            }
        );
    }
}
