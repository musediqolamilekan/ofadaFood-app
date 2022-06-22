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
        // localStorage.getItem("date")
        this.currency = localStorage.getItem("currency_symbol");
        this.util.navCtrl.navigateForward("tabs/home/cart");
        // this.util.navCtrl.navigateForward("tabs/home/make-payment");
    }

    ngOnInit() {}
    ionViewWillEnter() {
        this.util.startLoad();
        this.id = localStorage.getItem("order-id");
        this.api.getDataWithToken("singleOrder/" + this.id).subscribe(
            (success: any) => {
                if (success.success) {
                    const updated = success.data.child.map((a) => {
                        a.id = a.product_id;
                        a.service = a.service.map((a) => {
                            a.single_service_id = a.service_id;
                            a.total = a.price;
                            a.type = a.serviceName;
                            return a;
                        });
                        return a;
                    });
                    localStorage.setItem("orders", JSON.stringify([updated]));
                    localStorage.setItem(
                        "totalAmount",
                        JSON.stringify(success.data.payment)
                    );
                    localStorage.setItem("address-id", success.data.addr_id);
                    localStorage.setItem("email", success.data.user.email);
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
