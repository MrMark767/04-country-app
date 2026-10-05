import type { Country } from '../interfaces/country.interface';
import type { RESTCountry } from '../interfaces/rest-countries.interface';

export class CountryMapper {
  // static RestCountry => Country
  static mapRestCountryToCountry(restCountry: RESTCountry): Country {
    return {
      capital: restCountry.capital?.join(', ') ?? 'Sin capital',
      cca2: restCountry.cca2,
      flag: restCountry.flag ?? '',
      flagSvg: restCountry.flags?.svg ?? restCountry.flags?.png ?? '',
      name: restCountry.translations['spa']?.common ?? restCountry.name?.common ?? 'Sin nombre',
      population: restCountry.population ?? 0,

      region: restCountry.region,
      subRegion: restCountry.subregion ?? 'Sin subregión',
    };
  }

  // static RestCountry[] => Country[]
  static mapRestCountryArrayToCountryArray(
    restCountries: RESTCountry[]
  ): Country[] {
    return restCountries.map((c) => CountryMapper.mapRestCountryToCountry(c));
  }
}
