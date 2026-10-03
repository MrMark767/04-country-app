import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { RESTCountry } from '../interfaces/rest-countries.interface';
import { map, Observable, catchError, throwError, of, shareReplay } from 'rxjs';
import type { Country } from '../interfaces/country.interface';
import { CountryMapper } from '../mappers/country.mapper';

const API_URL = 'https://studies.cs.helsinki.fi/restcountries/api';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private http = inject(HttpClient);
  private allCountries$?: Observable<RESTCountry[]>;

  private getAllCountries(): Observable<RESTCountry[]> {
    if (!this.allCountries$) {
      this.allCountries$ = this.http.get<RESTCountry[]>(`${API_URL}/all`).pipe(
        shareReplay(1)
      );
    }
    return this.allCountries$;
  }

  searchByCapital(query: string): Observable<Country[]> {
    query = query.toLowerCase().trim();
    if (!query) return of([]);

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.filter((c) =>
          c.capital?.some((cap) => cap.toLowerCase().includes(query))
        )
      ),
      map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
      catchError((error) => {
        console.log('Error fetching ', error);

        return throwError(
          () => new Error(`No se pudo obtener países con ese query ${query}`)
        );
      })
    );
  }

  searchByCountry(query: string): Observable<Country[]> {
    query = query.toLowerCase().trim();
    if (!query) return of([]);

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.filter(
          (c) =>
            c.name.common.toLowerCase().includes(query) ||
            c.name.official.toLowerCase().includes(query) ||
            c.translations?.['spa']?.common?.toLowerCase().includes(query) ||
            c.translations?.['spa']?.official?.toLowerCase().includes(query)
        )
      ),
      map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
      catchError((error) => {
        console.log('Error fetching ', error);

        return throwError(
          () => new Error(`No se pudo obtener países con ese query ${query}`)
        );
      })
    );
  }

  searchCountryByAlphaCode(code: string): Observable<Country | undefined> {
    code = code.toLowerCase().trim();

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.find(
          (c) =>
            c.cca2.toLowerCase() === code ||
            c.cca3?.toLowerCase() === code ||
            c.cioc?.toLowerCase() === code
        )
      ),
      map((country) =>
        country ? CountryMapper.mapRestCountryToCountry(country) : undefined
      ),
      catchError((error) => {
        console.log('Error fetching ', error);

        return throwError(
          () => new Error(`No se pudo obtener países con ese código ${code}`)
        );
      })
    );
  }

  searchByRegion(region: string): Observable<Country[]> {
    region = region.toLowerCase().trim();
    if (!region) return of([]);

    return this.getAllCountries().pipe(
      map((countries) =>
        countries.filter((c) => c.region?.toLowerCase() === region)
      ),
      map((resp) => CountryMapper.mapRestCountryArrayToCountryArray(resp)),
      catchError((error) => {
        console.log('Error fetching ', error);

        return throwError(
          () => new Error(`No se pudo obtener países con esa región ${region}`)
        );
      })
    );
  }
}
