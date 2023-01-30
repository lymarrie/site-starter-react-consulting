import {
  Template,
  TemplateConfig,
  GetHeadConfig,
  HeadConfig,
} from "@yext/pages";
import "src/index.css";
import "src/styles/search.css";
import { defaultHeadConfig } from "src/common/head";
import { SearchHeadlessProvider } from "@yext/search-headless-react";
import Locator from "src/components/search/Locator";
import { Main } from "src/layouts/main";
import { BrowserRouter } from "react-router-dom";
import { getRuntime } from "@yext/pages/util";
import { SearchPageProfile, TemplateRenderProps } from "src/types/entities";
import { SEARCH_PATH, getSearchProvider } from "src/config";

/**
 * Not required depending on your use case.
 */
export const config: TemplateConfig = {
  stream: {
    $id: "search-page",
    // Specifies the exact data that each generated document will contain. This data is passed in
    // directly as props to the default exported function.
    fields: [
      "id",
      "uid",
      "meta",
      "name",
      "c_searchTitle",
      "c_searchSubTitle",
      "c_searchPlaceholderText"
    ],
    // Defines the scope of entities that qualify for this stream.
    filter: {
      entityIds: ["search-page"],
    },
    // The entity language profiles that documents will be generated for.
    localization: {
      locales: ["en"],
      primary: false,
    },
  },
  alternateLanguageFields: [
    "name",
    "slug"
  ],
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: This currently has no impact on the local dev path. Local dev urls currently
 * take on the form: featureName/entityId
 */
export const getPath = (): string => {
  return SEARCH_PATH;
};

/**
 * This allows the user to define a function which will take in their template
 * data and procude a HeadConfig object. When the site is generated, the HeadConfig
 * will be used to generate the inner contents of the HTML document"s <head> tag.
 * This can include the title, meta tags, script tags, etc.
 */
 export const getHeadConfig: GetHeadConfig<TemplateRenderProps<SearchPageProfile>> = (data): HeadConfig => {
  return defaultHeadConfig(data);
};


/**
 * This is the main template. It can have any name as long as it"s the default export.
 * The props passed in here are the direct result from `getStaticProps`.
 */
const Search: Template<TemplateRenderProps<SearchPageProfile>> = (data) => {
  const { document } = data;
  const {
    c_searchTitle,
    c_searchSubTitle,
    c_searchPlaceholderText,
    _site,
  } = document;

  const runtime = getRuntime();
  const searcher = getSearchProvider(_site.c_searchExperienceAPIKey ?? '', document.meta.locale);

  if (!_site.c_searchExperienceAPIKey) {
    console.error("Add the search experience API key to the Site Entity");
  }

  return (
    <Main data={data}>
      <SearchHeadlessProvider searcher={searcher}>
        {runtime.name === 'browser' && (
          <BrowserRouter>
            <Locator
              title={ c_searchTitle }
              subTitle={ c_searchSubTitle }
              placeholderText={ c_searchPlaceholderText }
            />
          </BrowserRouter>
        )}
      </SearchHeadlessProvider>
    </Main>
  );
};

export default Search;
