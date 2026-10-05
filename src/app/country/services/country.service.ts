import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { RESTCountry } from '../interfaces/rest-countries.interface';
import { map, Observable, catchError, throwError, of, shareReplay, tap } from 'rxjs';
import type { Country } from '../interfaces/country.interface';
import { CountryMapper } from '../mappers/country.mapper';
import { Region } from '../interfaces/region.type';

const API_URL = 'https://studies.cs.helsinki.fi/restcountries/api';

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private http = inject(HttpClient);
  private allCountries$?: Observable<RESTCountry[]>;

  private queryCacheCapital = new Map<string, Country[]>();
  private queryCacheCountry = new Map<string, Country[]>();
  private queryCacheRegion = new Map<Region, Country[]>();

  private getAllCountries(): Observable<RESTCountry[]> {
    if (!this.allCountries$) {
      this.allCountries$ = this.http
        .get<RESTCountry[]>('/data/countries.json')
        .pipe(
          catchError((err) => {
            console.warn('Local countries.json fallback to remote API:', err);
            return this.http.get<RESTCountry[]>(`${API_URL}/all`);
          }),
          shareReplay(1)
        );
    }
    return this.allCountries$;
  }

  searchByCapital(query: string): Observable<Country[]> {
    const rawQuery = query.toLowerCase().trim();
    const cleanQuery = normalize(query.trim());
    if (!cleanQuery) return of([]);

    if (this.queryCacheCapital.has(rawQuery)) {
      return of(this.queryCacheCapital.get(rawQuery) ?? []);
    }

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.filter((c) =>
          c.capital?.some(
            (cap) =>
              cap.toLowerCase().includes(rawQuery) ||
              normalize(cap).includes(cleanQuery)
          )
        )
      ),
      map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
      tap((countries) => this.queryCacheCapital.set(rawQuery, countries)),
      catchError((error) => {
        console.error('Error fetching countries by capital:', error);

        return throwError(
          () => new Error(`No se pudo obtener países con ese query ${query}`)
        );
      })
    );
  }

  searchByCountry(query: string): Observable<Country[]> {
    const rawQuery = query.toLowerCase().trim();
    const cleanQuery = normalize(query.trim());
    if (!cleanQuery) return of([]);

    if (this.queryCacheCountry.has(rawQuery)) {
      return of(this.queryCacheCountry.get(rawQuery) ?? []);
    }

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.filter(
          (c) =>
            c.name.common.toLowerCase().includes(rawQuery) ||
            normalize(c.name.common).includes(cleanQuery) ||
            c.name.official.toLowerCase().includes(rawQuery) ||
            normalize(c.name.official).includes(cleanQuery) ||
            c.translations?.['spa']?.common?.toLowerCase().includes(rawQuery) ||
            (c.translations?.['spa']?.common &&
              normalize(c.translations['spa'].common).includes(cleanQuery)) ||
            c.translations?.['spa']?.official?.toLowerCase().includes(rawQuery) ||
            (c.translations?.['spa']?.official &&
              normalize(c.translations['spa'].official).includes(cleanQuery))
        )
      ),
      map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
      tap((countries) => this.queryCacheCountry.set(rawQuery, countries)),
      catchError((error) => {
        console.error('Error fetching countries by name:', error);

        return throwError(
          () => new Error(`No se pudo obtener países con ese query ${query}`)
        );
      })
    );
  }

  searchCountryByAlphaCode(code: string): Observable<Country | undefined> {
    const cleanCode = code.toLowerCase().trim();

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.find(
          (c) =>
            c.cca2.toLowerCase() === cleanCode ||
            c.cca3?.toLowerCase() === cleanCode ||
            c.cioc?.toLowerCase() === cleanCode
        )
      ),
      map((country) =>
        country ? CountryMapper.mapRestCountryToCountry(country) : undefined
      ),
      catchError((error) => {
        console.error('Error fetching country by alpha code:', error);

        return throwError(
          () => new Error(`No se pudo obtener países con ese código ${code}`)
        );
      })
    );
  }

  searchByRegion(region: Region): Observable<Country[]> {
    if (this.queryCacheRegion.has(region)) {
      return of(this.queryCacheRegion.get(region) ?? []);
    }

    const cleanRegion = normalize(region);

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.filter(
          (c) => c.region && normalize(c.region) === cleanRegion
        )
      ),
      map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
      tap((countries) => this.queryCacheRegion.set(region, countries)),
      catchError((error) => {
        console.error('Error fetching countries by region:', error);

        return throwError(
          () => new Error(`No se pudo obtener países con esa región ${region}`)
        );
      })
    );
  }
}
