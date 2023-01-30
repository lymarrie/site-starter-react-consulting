import { FilterSearch, executeSearch } from "@yext/search-ui-react";
import { useSearchActions } from "@yext/search-headless-react";
import { checkIsLocationFilter } from "src/components/search/utils/checkIsLocationFilter";
import { facet_config, locationFilterToType } from "src/components/search/utils/handleSearchParams";
import { LOCATOR_STATIC_FILTER_FIELD, LOCATOR_ENTITY_TYPE } from "src/config";
import type { SetSearchParamsType } from "src/types/additional";
import GeolocateButton from "src/components/search/GeolocateButton";

const searchFields = [
  { fieldApiName: LOCATOR_STATIC_FILTER_FIELD, entityType: LOCATOR_ENTITY_TYPE },
];

type SearchBoxProps = {
  title: string;
  subTitle: string;
  placeholderText?: string;
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParamsType;
}

export default function SearchBox(props: SearchBoxProps) {
  const {
    title,
    subTitle,
    placeholderText,
    searchParams,
    setSearchParams
  } = props;

  const searchActions = useSearchActions();

  return (
    <div className="shadow-brand-shadow p-6">
      <h1 className="Heading--lead mb-4">
        { title }
      </h1>
      <div className="mb-2 text-brand-gray-400">
        { subTitle }
      </div>
      <div className="flex items-center">
        <div className="relative w-full h-9">
          <FilterSearch
            customCssClasses={{
              filterSearchContainer: "absolute w-full",
            }}
            label=""
            placeholder={ placeholderText }
            searchFields={ searchFields }
            onSelect={({
              executeFilterSearch,
              newDisplayName,
              newFilter,
              setCurrentFilter,
            }) => {
              // Unselect selected matching filters.
              const matchingFilters = searchActions.state.filters.static?.filter(({ filter, selected }) => 
                selected
                && filter.kind === "fieldValue"
                && (LOCATOR_STATIC_FILTER_FIELD === "builtin.location" ? checkIsLocationFilter(filter) : searchFields.some(s => s.fieldApiName === filter.fieldId))
              ) ?? [];
              matchingFilters.forEach(f => searchActions.setFilterOption({ filter: f.filter, selected: false }));

              // Update the static filter state with the new filter.
              searchActions.setFilterOption({
                filter: newFilter,
                displayName: newDisplayName,
                selected: true
              });
              setCurrentFilter(newFilter);
              executeFilterSearch(newDisplayName);

              // Update URLSearchParams.
              searchParams.set('q', newFilter.value.toString());
              searchParams.set('qp', newDisplayName);
              searchParams.delete('r');

              // For builtin.location we need to also indicate the type of filter being used so it can be loaded in correctly.
              // TODO: When product updates the component check to make sure this isn't needed then.
              if (checkIsLocationFilter(newFilter)) {
                const locationType = locationFilterToType(newFilter.fieldId);
                searchParams.set('location_type', locationType);
              }

              // Remove facets from url on new search
              const facetParams = Array.from(Object.keys(facet_config));
              for (const facet of facetParams) {
                searchParams.delete(facet);
              }

              setSearchParams(searchParams);

              // Run new search with updated filter
              searchActions.setOffset(0);
              searchActions.resetFacets();
              executeSearch(searchActions);
            }}
          />
        </div>
        <GeolocateButton
          className="ml-4"
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>
    </div>
  )
}
