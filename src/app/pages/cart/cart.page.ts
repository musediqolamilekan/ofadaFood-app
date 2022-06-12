import { Component, OnInit } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";
import { ApiService } from "src/app/api.service";
import { AddAddressPage } from "src/app/modals/add-address/add-address.page";
import { CalendarPage } from "src/app/modals/calendar/calendar.page";
import { UtilService } from "src/app/util.service";
import { LoginPage } from "../login/login.page";
import { ManageAddressPage } from "../manage-address/manage-address.page";

@Component({
    selector: "app-cart",
    templateUrl: "./cart.page.html",
    styleUrls: ["./cart.page.scss"],
})
export class CartPage implements OnInit {
    today: any = `${
        new Date().getDate() < 10
            ? `0${new Date().getDate()}`
            : new Date().getDate()
    }-${
        new Date().getMonth() + 1 < 10
            ? `0${new Date().getMonth() + 1}`
            : new Date().getMonth() + 1
    }-${new Date().getFullYear()}`;
    address: any = "";
    date: any;
    totalBill = 0;
    currency: any;
    payment: number;
    addressDiv: any = [];
    constructor(
        private modal: ModalController,
        private util: UtilService,
        private api: ApiService,
        private alertController: AlertController
    ) {}

    ngOnInit() {}
    async presentAlertConfirm() {
        const alert = await this.alertController.create({
            cssClass: "my-custom-class",
            // header: "Confirm!",
            subHeader: "Order registered successfully",
            message: "Do you want to order for another meal?",
            buttons: [
                {
                    text: "No",
                    role: "cancel",
                    cssClass: "secondary",
                    //   id: 'Yes',
                    handler: () => {
                        this.makePay();
                    },
                },
                {
                    text: "Yes",
                    //   id: 'confirm-button',
                    handler: () => {
                        this.util.navCtrl.navigateBack("tabs/home");
                    },
                },
            ],
        });
        await alert.present();
    }

    async manageAddress() {
        localStorage.setItem("isFrom", "cart");
        const modal = await this.modal.create({
            component: ManageAddressPage,
        });
        modal.onDidDismiss().then((res) => {
            localStorage.setItem("address-id", res.data.id);
            this.address = res.data.addr1;
            localStorage.removeItem("isFrom");
        });
        return await modal.present();
    }
    clearCart() {
        this.cartDataDisplay = [];
        this.tot = 0;
        this.allOrders = [];
        this.util.startLoad();
        localStorage.removeItem("date");
        localStorage.removeItem("totalAmount");
        localStorage.removeItem("orders");
        localStorage.removeItem("cart-data");
        this.util.dismissLoader();
        this.util.presentToast("Orders and Cart items Cleared!");
    }

    setOrder() {
        const allCart = JSON.parse(localStorage.getItem("cart-data"));
        const allCurrOrders = JSON.parse(localStorage.getItem("orders")) || [];

        if (!allCart && !allCurrOrders) {
            this.util.presentToast("Please add items to cart");
        } else if (this.address == "") {
            this.util.presentToast("Address are Required");
        } else {
            const prevTotal =
                allCurrOrders && !allCart
                    ? 0
                    : localStorage.getItem("totalAmount")
                    ? JSON.parse(localStorage.getItem("totalAmount"))
                    : 0;
            localStorage.setItem(
                "totalAmount",
                (this.api?.total || 0) + prevTotal
            );
            const AllCurrOrders =
                JSON.parse(localStorage.getItem("orders")) && allCart
                    ? [...JSON.parse(localStorage.getItem("orders")), allCart]
                    : JSON.parse(localStorage.getItem("orders"))
                    ? [...JSON.parse(localStorage.getItem("orders"))]
                    : [allCart];
            localStorage.setItem("orders", JSON.stringify(AllCurrOrders));
            localStorage.removeItem("cart-data");
            // this.util.presentToast("Order registered successfully");
            this.presentAlertConfirm();
        }
    }

    makePay() {
        const allCurrOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const allCart = JSON.parse(localStorage.getItem("cart-data"));
        this.totalBill = JSON.parse(localStorage.getItem("totalAmount"));
        // if (this.totalBill == 0) {
        // } else if (this.address == "") {
        //     this.util.presentToast("Address are Required");
        //     // } else if (!this.date) {
        //     //     this.util.presentToast("Delevery date is Required");
        // } else if (!allCurrOrders && !allCart) {
        //     this.util.presentToast(
        //         "Please add items to cart before you order!"
        //     );
        // } else if (allCart) {
        // const allOrders = [...allCurrOrders, allCart];
        // localStorage.setItem("orders", JSON.stringify(allOrders));
        // localStorage.removeItem("cart-data");
        // const prevTotal = localStorage.getItem("totalAmount")
        //     ? JSON.parse(localStorage.getItem("totalAmount"))
        //     : 0;
        // localStorage.setItem("totalAmount", this.api.total + prevTotal);
        this.util.navCtrl.navigateForward("tabs/home/make-payment");
        // } else {
        //     this.util.navCtrl.navigateForward("tabs/home/make-payment");
        // }
    }
    async presentModal() {
        const modal = await this.modal.create({
            component: CalendarPage,
            cssClass: "calendar",
        });
        modal.onDidDismiss().then((res) => {
            this.date = this.api.date;
            localStorage.setItem("date", this.api.date);
        });
        return await modal.present();
    }

    cartDataDisplay: any = [];
    allOrders: any = [];
    service: any = [];
    tot = 0;
    ionViewWillEnter() {
        this.api.getDataWithToken("profile").subscribe((success: any) => {
            if (success.success) {
                localStorage.setItem("email", success.data.email);
            }
        });

        this.allOrders = JSON.parse(localStorage.getItem("orders"));
        this.cartDataDisplay = JSON.parse(localStorage.getItem("cart-data"))
            ? JSON.parse(localStorage.getItem("cart-data"))
            : [];
        this.cartDataDisplay.forEach((element) => {
            element.total = element.service.qty * element.service.price;
            this.totalBill += element.total;
            localStorage.setItem("totalQty", this.api.qty);
            this.service = element.service;
            this.service.forEach((element) => {
                let price = JSON.parse(element.price) * element.qty;
                this.tot += element.total;
                this.api.total = this.tot;
                this.api.qty += element.qty;
            });
        });
        this.allOrders.length > 0 && this.tot == 0
            ? (this.tot = JSON.parse(localStorage.getItem("totalAmount")))
            : this.tot;

        this.util.startLoad();
        setTimeout(async () => {
            this.currency = localStorage.getItem("currency_symbol");
            let token = localStorage.getItem("token")
                ? localStorage.getItem("token")
                : "";
            if (token == "") {
                localStorage.setItem("previous-request", "true");
                localStorage.setItem("previous-request-page", "tabs/home/cart");
                const modal = await this.modal.create({
                    component: LoginPage,
                });
                modal.present();
                modal.onDidDismiss().then(() => {
                    this.util.startLoad();
                    this.api.getDataWithToken("all_address").subscribe(
                        (success: any) => {
                            if (success.success) {
                                this.addressDiv = success.data;
                                this.util.dismissLoader();
                            }
                        },
                        (err) => {}
                    );
                });
            }
            let hasPre = localStorage.getItem("previous-request")
                ? localStorage.getItem("previous-request")
                : false;
            let prePage = localStorage.getItem("previous-request-page")
                ? localStorage.getItem("previous-request-page")
                : "";
            if (hasPre == "true" && prePage == "cart") {
                localStorage.setItem("previous-request", "true");
                this.util.setNewLogin(true);
            }

            this.util.dismissLoader();
        }, 1000);

        this.util.startLoad();
        this.api.getDataWithToken("all_address").subscribe(
            (success: any) => {
                if (success.success) {
                    this.addressDiv = success.data;
                    this.util.dismissLoader();
                }
            },
            (err) => {}
        );
    }

    async addresss() {
        const modal = await this.modal.create({
            component: AddAddressPage,
            cssClass: "manage-address",
        });
        modal.onDidDismiss().then((res) => {
            this.address = res.data.addr1;
            localStorage.setItem("address-id", res.data.id);
            localStorage.removeItem("marketLat");
            localStorage.removeItem("marketLng");
        });
        return await modal.present();
    }
}
