import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SemiCartPage } from './semi-cart.page';

describe('SemiCartPage', () => {
  let component: SemiCartPage;
  let fixture: ComponentFixture<SemiCartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemiCartPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SemiCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
