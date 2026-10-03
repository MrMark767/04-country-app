import type { Country } from '../interfaces/country.interface';
import type { RESTCountry } from '../interfaces/rest-countries.interface';

export class CountryMapper {
  static mapRestCountryToCountry(restCountry: RESTCountry): Country {
    return {
      capital: restCountry.capital?.join(', ') ?? 'Sin capital',
      cca2: restCountry.cca2,
      flag: restCountry.flag ?? '',
      flagSvg: restCountry.flags?.svg ?? restCountry.flags?.png ?? '',
      name: restCountry.translations?.['spa']?.common ?? restCountry.name?.common ?? 'No Name',
      population: restCountry.population ?? 0,
      region: restCountry.region ?? '',
      subRegion: restCountry.subregion ?? '',
    };
  }

  static mapRestCountryArrayToCountryArray(
    restCountries: RESTCountry[]
  ): Country[] {
    return restCountries.map(this.mapRestCountryToCountry);
  }
}
