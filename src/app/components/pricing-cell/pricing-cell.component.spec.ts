import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricingCellComponent } from './pricing-cell.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PricingCellComponent', () => {
  let component: PricingCellComponent;
  let fixture: ComponentFixture<PricingCellComponent>;
  let inputEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingCellComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PricingCellComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  describe('initialization', () => {
    it('should initialize with numeric value', () => {
      component.value = 10;
      fixture.detectChanges();
      expect(component.control.value).toBe(10);
    });

    it('should initialize with string value "quote"', () => {
      component.value = 'quote';
      fixture.detectChanges();
      expect(component.control.value).toBe('quote');
    });
  });

  describe('input type detection', () => {
    it('should use number input for numeric values', () => {
      component.value = 15;
      fixture.detectChanges();
      expect(inputEl.nativeElement.type).toBe('number');
    });

    it('should use text input for "quote" value', () => {
      component.value = 'quote';
      fixture.detectChanges();
      expect(inputEl.nativeElement.type).toBe('text');
    });

    it('should use text input for "n/a" value', () => {
      component.value = 'n/a';
      fixture.detectChanges();
      expect(inputEl.nativeElement.type).toBe('number');
    });
  });

  describe('disabled state', () => {
    it('should disable input for "dropout" value', () => {
      component.value = 'dropout';
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(true);
      expect(inputEl.nativeElement.disabled).toBe(true);
    });

    it('should disable input for "n/a" value', () => {
      component.value = 'n/a';
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(true);
      expect(inputEl.nativeElement.disabled).toBe(true);
    });

    it('should enable input for numeric values', () => {
      component.value = 20;
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(false);
      expect(inputEl.nativeElement.disabled).toBe(false);
    });
  });

  describe('value emission', () => {
    it('should emit numeric value on valid number input', (done) => {
      component.value = 10;
      fixture.detectChanges();

      component.valueChange.subscribe((value) => {
        expect(value).toBe(25);
        done();
      });

      inputEl.nativeElement.value = '25';
      inputEl.nativeElement.dispatchEvent(new Event('input'));
    });

    it('should emit 0 for empty input', (done) => {
      component.value = 10;
      fixture.detectChanges();

      component.valueChange.subscribe((value) => {
        expect(value).toBe(0);
        done();
      });

      inputEl.nativeElement.value = '';
      inputEl.nativeElement.dispatchEvent(new Event('input'));
    });

    it('should emit "quote" for quote value', (done) => {
      component.value = 'quote';
      fixture.detectChanges();

      component.valueChange.subscribe((value) => {
        expect(value).toBe('quote');
        done();
      });

      inputEl.nativeElement.value = 'quote';
      inputEl.nativeElement.dispatchEvent(new Event('input'));
    });
  });

  describe('validation', () => {
    it('should mark control as invalid for non-numeric string', () => {
      component.value = 10;
      fixture.detectChanges();

      component.control.setValue('invalid');
      expect(component.control.invalid).toBe(true);
    });

    it('should mark control as valid for numeric string', () => {
      component.value = 10;
      fixture.detectChanges();

      component.control.setValue('25');
      expect(component.control.valid).toBe(true);
    });

    it('should mark control as valid for "quote"', () => {
      component.value = 'quote';
      fixture.detectChanges();

      component.control.setValue('quote');
      expect(component.control.valid).toBe(true);
    });

    it('should show error message when touched and invalid', () => {
      component.value = 10;
      fixture.detectChanges();

      component.control.setValue('invalid');
      component.control.markAsTouched();
      fixture.detectChanges();

      const errorMsg = fixture.debugElement.query(By.css('.error-msg'));
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.nativeElement.textContent).toContain('Invalid value');
    });
  });

  describe('special CSS classes', () => {
    it('should apply special class for disabled values', () => {
      component.value = 'dropout';
      fixture.detectChanges();

      expect(inputEl.nativeElement.classList.contains('special')).toBe(true);
    });

    it('should apply error class for invalid touched controls', () => {
      component.value = 10;
      fixture.detectChanges();

      component.control.setValue('invalid');
      component.control.markAsTouched();
      fixture.detectChanges();

      expect(inputEl.nativeElement.classList.contains('error')).toBe(true);
    });
  });
});
