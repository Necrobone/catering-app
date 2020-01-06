import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HeadquartersPage } from './headquarters.page';

describe('HeadquartersPage', () => {
  let component: HeadquartersPage;
  let fixture: ComponentFixture<HeadquartersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadquartersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HeadquartersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
