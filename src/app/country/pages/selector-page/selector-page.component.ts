import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import {
  Region,
  SmallCountry,
  Country,
} from '../../interfaces/country.interface';
import { filter, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'country-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``,
})
export class SelectorPageComponent implements OnInit {
  myForm = this.formBuilder.group({
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    border: ['', [Validators.required]],
  });
  countriesByRegion: SmallCountry[] = [];
  borders: SmallCountry[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.#onRegionChanged();
    this.#onCountryChanged();
  }

  get regions(): Region[] {
    return this.countryService.regions;
  }

  #onRegionChanged(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        tap(() => {
          return this.myForm.controls.country.setValue('');
        }),
        tap(() => (this.borders = [])),
        switchMap((region) => {
          return this.countryService.getCountriesByRegion(region as Region);
        })
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  #onCountryChanged(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => {
          return this.myForm.get('border')!.setValue('');
        }),
        filter((value) => value !== '' && value !== null),
        switchMap((alphaCode) => {
          return this.countryService.getCountryByAlphaCode(alphaCode as string);
        }),
        switchMap((country) => {
          return this.countryService.getCountryBordersByCodes(country.borders!);
        })
      )
      .subscribe((countries) => {
        this.borders = countries;
      });
  }
}
