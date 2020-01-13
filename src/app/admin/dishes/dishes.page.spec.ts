import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DishesPage } from './dishes.page';

describe('DishesPage', () => {
  let component: DishesPage;
  let fixture: ComponentFixture<DishesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DishesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DishesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
