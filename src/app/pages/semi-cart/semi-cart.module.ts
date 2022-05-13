import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SemiCartPageRoutingModule } from './semi-cart-routing.module';

import { SemiCartPage } from './semi-cart.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SemiCartPageRoutingModule
  ],
  declarations: [SemiCartPage]
})
export class SemiCartPageModule {}
