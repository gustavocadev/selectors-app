import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  combineLatest,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  baseUrl = 'https://restcountries.com/v3.1';
  #regions: Region[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  constructor(private readonly http: HttpClient) {}

  get regions(): Region[] {
    return [...this.#regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);

    const url = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;
    return this.http.get<SmallCountry[]>(url);
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<SmallCountry>(url);
  }

  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (borders.length === 0) return of([]);

    const countryRequest: Observable<SmallCountry>[] = [];

    borders.forEach((code) => {
      const req = this.getCountryByAlphaCode(code);
      countryRequest.push(req);
    });

    return combineLatest(countryRequest);
  }
}
