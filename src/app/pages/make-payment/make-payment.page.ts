import { Component, OnInit } from "@angular/core";
import { utils } from "protractor";
import { ApiService } from "src/app/api.service";
import { UtilService } from "src/app/util.service";
import { PaystackOptions } from "angular4-paystack";
declare var Stripe;
declare var RazorpayCheckout: any;
@Component({
    selector: "app-make-payment",
    templateUrl: "./make-payment.page.html",
    styleUrls: ["./make-payment.page.scss"],
})
export class MakePaymentPage implements OnInit {
    getTotal = `${localStorage.getItem("totalAmount")}00`;
    getCharges = Number(this.getTotal) * 0.05;
    getVAT = this.getCharges * 0.075;
    email = localStorage.getItem("email");
    paystackTotal = Number(this.getTotal) + this.getCharges + this.getVAT;
    options: PaystackOptions = {
        amount: Math.round(this.paystackTotal),
        email: this.email,
        ref: `${Math.ceil(Math.random() * 10e10)}`,
    };
    profile: any;
    address: string;
    date: string;
    totalItems: any = [];
    totalPayment: any;
    finalTotal: any;
    VAT: any;
    serviceCharge: any;
    qty = 0;
    couponType: any;
    discount = 0;
    disPay: number;
    dataTrue: boolean = true;
    err: any;
    isBtn = false;
    currency: string;
    stripe: any;
    razor: any;
    card: any;
    payment_token: any;
    currency_: any;
    payment: any;
    title: any;
    items: any = [];

    constructor(private api: ApiService, private util: UtilService) {}
    paymentInit() {
        console.log("Payment initialized");
    }

    paymentDone(ref: any) {
        this.title = "Payment successfull";
        console.log(this.title, ref);
        this.util.startLoad();
        this.isBtn = true;
        // const allProducts = this.totalItems.reduce((acc, product) => {
        //     acc.push(...product);
        //     return acc;
        // }, []);
        this.totalItems.map((order, i) => {
            let singleOrderPrice = 0;
            order.forEach((item) => {
                item.service.forEach((s) => (singleOrderPrice += s.total));
            });
            let data = {
                addr_id: localStorage.getItem("address-id"),
                date: this.date,
                payment: singleOrderPrice,
                payment_type: "paystack",
                products: order,
                coupon_id: localStorage.getItem("coupon-id"),
                discount: this.disPay,
            };
            this.api.postDataWithToken("order", data).subscribe(
                (success: any) => {
                    if (success.success && i >= this.totalItems.length - 1) {
                        this.util.navCtrl.navigateRoot("payment-done");
                        // localStorage.removeItem("address-id");
                        localStorage.removeItem("date");
                        localStorage.removeItem("totalAmount");
                        // localStorage.removeItem("SelectAddress");
                        localStorage.removeItem("orders");
                        localStorage.removeItem("discount_type");
                        this.util.dismissLoader();
                    }
                },
                (err) => {
                    this.util.dismissLoader();
                }
            );
        });
    }

    paymentCancel() {
        console.log("payment failed");
    }
    ngOnInit() {
        this.totalPayment = localStorage.getItem("totalAmount");
        this.serviceCharge = this.totalPayment * 0.05;
        this.VAT = this.serviceCharge * 0.075;
        this.finalTotal =
            Number(this.totalPayment) +
            Number(this.serviceCharge) +
            Number(this.VAT);
        this.util.startLoad();
        this.currency = localStorage.getItem("currency");
        this.currency_ = localStorage.getItem("currency_symbol");
        this.api.getDataWithToken("profile").subscribe(
            (success: any) => {
                if (success.success) {
                    this.profile = success.data.name;
                    this.util.dismissLoader();
                }
            },
            (err) => {}
        );

        this.api.getDataWithToken("payment").subscribe(
            (success: any) => {
                if (success.success) {
                    this.payment = success.data;
                    this.stripe = Stripe(this.payment.stripe_public_key);
                    this.razor = this.payment.razorpay_public_key;
                }
            },
            (err) => {}
        );
    }

    ionViewWillEnter() {
        this.address = localStorage.getItem("SelectAddress");
        this.date =
            localStorage.getItem("date") ||
            `${
                new Date().getDate() < 10
                    ? `0${new Date().getDate()}`
                    : new Date().getDate()
            }-${
                new Date().getMonth() + 1 < 10
                    ? `0${new Date().getMonth() + 1}`
                    : new Date().getMonth() + 1
            }-${new Date().getFullYear()}`;
        this.totalItems = JSON.parse(localStorage.getItem("orders"));

        this.totalItems.forEach((a) =>
            a.forEach((element) => {
                this.qty += element.qty;
            })
        );

        this.items = this.totalItems.reduce((acc, b) => {
            acc.push(...b);
            return acc;
        }, []);

        this.couponType = localStorage.getItem("discount_type");
        this.discount = parseInt(localStorage.getItem("discount_"));

        if (this.discount >= 0) {
            this.discountTotal();
        }
    }
    ionViewDidEnter() {}

    setupPaypal() {
        if (this.dataTrue) {
            this.dataTrue = false;
            let _this = this;
            setTimeout(() => {
                <any>window["paypal"]
                    .Buttons({
                        createOrder: function (data, actions) {
                            return actions.order.create({
                                purchase_units: [
                                    {
                                        amount: {
                                            value: _this.totalPayment,
                                        },
                                    },
                                ],
                            });
                        },
                        onApprove: (data, actions) => {
                            const that = this;
                            return actions.order
                                .capture()
                                .then(function (details) {
                                    this.isBtn = true;
                                    let data = {
                                        paymentType: "PAYPAL",
                                        paymentId: details.id,
                                        paymentStatus: details.status,
                                    };
                                    localStorage.setItem(
                                        "paypalId",
                                        details.id
                                    );
                                    _this.makePay();
                                    console.log(
                                        "Transaction completed by " +
                                            details.payer.name.given_name +
                                            "!"
                                    );
                                })
                                .catch((err) => {
                                    this.err = err.error.errors;
                                    this.util.presentToast(
                                        "Sorry Payment is Not Possible in PayPal"
                                    );
                                });
                        },
                    })
                    .render("#paypal-button-container");
            }, 50);
        }
    }

    payWithRazor() {
        var options = {
            description: "Credits towards consultation",
            image: "https://i.imgur.com/3g7nmJC.png",
            currency: this.currency,
            key: this.razor,
            amount: this.totalPayment * 100,
            name: this.profile,
            theme: {
                color: "#2C69A5",
            },
            modal: {
                ondismiss: function () {
                    alert("dismissed");
                },
            },
        };

        var successCallback = (payment_id) => {
            alert("payment_id: " + payment_id);
            localStorage.setItem("paymentRazor", payment_id);
            this.razo();
        };

        var cancelCallback = (error) => {
            this.util.presentToast("Sorry ! Payment not Posible With RazorPay");
        };

        RazorpayCheckout.open(options, successCallback, cancelCallback);
    }

    setupStripe() {
        this.util.startLoad();

        let elements = this.stripe.elements();
        var style = {
            base: {
                color: "#32325d",
                lineHeight: "24px",
                fontFamily: "pop-medium",
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4",
                },
            },
            invalid: {
                color: "#eb445a",
                iconColor: "#eb445a",
            },
        };
        this.card = elements.create("card", { style: style });

        setTimeout(() => {
            this.card.mount("#element");
            this.card.addEventListener("change", (event) => {
                var displayError = document.getElementById("card-errors");
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = "";
                }
            });
        }, 1000);
    }

    stripePay() {
        this.util.startLoad();

        setTimeout(() => {
            this.setupStripe();
            this.util.dismissLoader();
        }, 1000);
    }

    discountTotal() {
        if (this.couponType == "Percentage") {
            this.disPay = (this.totalPayment * this.discount) / 100;
            this.totalPayment -= this.disPay;
        }
        if (this.couponType == "Amount") {
            this.disPay = this.discount;
            this.totalPayment = this.totalPayment - this.discount;
        }
    }

    payment_div: any = [
        // {
        //     name: "Paypal",
        //     img: "../../../assets/payment/paypal.png",
        //     checked: true,
        // },
        // {
        //     name: "RazorPay",
        //     img: "../../../assets/payment/Group 6996.png",
        //     checked: false,
        // },
        // {
        //     name: "Stripe",
        //     img: "../../../assets/payment/stripe.png",
        //     checked: false,
        // },
        {
            name: "CashPay",
            checked: false,
        },
    ];
    checkSelect: any = "Paypal";
    checkboxChange(e) {
        this.payment_div.forEach((element) => {
            element.checked = false;
        });
        e.checked = true;
        this.checkSelect = e.name;
        console.log(this.checkSelect);

        if (this.checkSelect == "Stripe") {
            if (this.payment.stripe == 0) {
                this.util.presentToast("Payment not Possible");
            } else {
                this.dataTrue = true;
                this.setupStripe();
                setTimeout(() => {
                    var form = document.getElementById("payment-form");

                    form.addEventListener("submit", (event) => {
                        event.preventDefault();
                        this.stripe.createSource(this.card).then((result) => {
                            if (result.error) {
                                var errorElement =
                                    document.getElementById("card-errors");
                                errorElement.textContent = result.error.message;
                            } else {
                                this.payment_token = result.source.id;
                                this.stri();
                                this.isBtn = true;
                            }
                        });
                    });
                }, 500);
            }
        } else if (this.checkSelect == "Paypal") {
            if (this.payment.paypal == 0) {
                this.util.presentToast("Payment Nost Possible");
            } else {
                this.setupPaypal();
            }
        } else if (this.checkSelect == "RazorPay") {
            this.dataTrue = true;
            if (this.payment.razorpay == 0) {
                this.util.presentToast("Payment Not Possible");
            }
        }
    }

    stri() {
        this.util.startLoad();
        this.isBtn = true;
        let data = {
            addr_id: localStorage.getItem("address-id"),
            date: this.date,
            payment: this.totalPayment,
            payment_type: "STRIPE ",
            products: this.totalItems,
            coupon_id: localStorage.getItem("coupon-id"),
            discount: this.disPay,
            payment_token: this.payment_token,
        };
        this.api.postDataWithToken("order", data).subscribe(
            (success: any) => {
                if (success.success) {
                    this.util.navCtrl.navigateRoot("payment-done");
                    // localStorage.removeItem("address-id");
                    localStorage.removeItem("date");
                    localStorage.removeItem("totalAmount");
                    // localStorage.removeItem("SelectAddress");
                    localStorage.removeItem("orders");
                    localStorage.removeItem("discount_type");
                    this.util.dismissLoader();
                }
            },
            (err) => {
                this.util.dismissLoader();
            }
        );
    }

    makePay() {
        this.util.startLoad();
        this.isBtn = true;
        let data = {
            addr_id: localStorage.getItem("address-id"),
            date: this.date,
            payment: this.totalPayment,
            payment_type: "PAYPAL",
            products: this.totalItems,
            coupon_id: localStorage.getItem("coupon-id"),
            discount: this.disPay,
            payment_token: localStorage.getItem("paypalId"),
        };
        this.api.postDataWithToken("order", data).subscribe(
            (success: any) => {
                if (success.success) {
                    this.util.navCtrl.navigateRoot("payment-done");
                    // localStorage.removeItem("address-id");
                    localStorage.removeItem("date");
                    localStorage.removeItem("totalAmount");
                    // localStorage.removeItem("SelectAddress");
                    localStorage.removeItem("orders");
                    localStorage.removeItem("discount_type");
                    this.util.dismissLoader();
                }
            },
            (err) => {
                this.util.dismissLoader();
            }
        );
    }

    razo() {
        this.util.startLoad();
        this.isBtn = true;
        let data = {
            addr_id: localStorage.getItem("address-id"),
            date: this.date,
            payment: this.totalPayment,
            payment_type: "RAZORPAY",
            products: this.totalItems,
            coupon_id: localStorage.getItem("coupon-id"),
            discount: this.disPay,
            payment_token: localStorage.getItem("paymentRazor"),
        };
        this.api.postDataWithToken("order", data).subscribe(
            (success: any) => {
                if (success.success) {
                    this.util.navCtrl.navigateRoot("payment-done");
                    // localStorage.removeItem("address-id");
                    localStorage.removeItem("date");
                    localStorage.removeItem("totalAmount");
                    // localStorage.removeItem("SelectAddress");
                    localStorage.removeItem("orders");
                    localStorage.removeItem("discount_type");
                    this.util.dismissLoader();
                }
            },
            (err) => {
                this.util.dismissLoader();
            }
        );
    }

    cash() {
        this.util.startLoad();
        this.isBtn = true;
        let data = {
            addr_id: localStorage.getItem("address-id"),
            date: this.date,
            payment: this.totalPayment,
            payment_type: "CASH ",
            products: this.totalItems,
            coupon_id: localStorage.getItem("coupon-id"),
            discount: this.disPay,
        };
        this.api.postDataWithToken("order", data).subscribe(
            (success: any) => {
                if (success.success) {
                    this.util.navCtrl.navigateRoot("payment-done");
                    // localStorage.removeItem("address-id");
                    localStorage.removeItem("date");
                    localStorage.removeItem("totalAmount");
                    // localStorage.removeItem("SelectAddress");
                    localStorage.removeItem("orders");
                    localStorage.removeItem("discount_type");
                    this.util.dismissLoader();
                }
            },
            (err) => {
                this.util.dismissLoader();
            }
        );
    }
}
