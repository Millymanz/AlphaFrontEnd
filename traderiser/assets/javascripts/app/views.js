/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 27/10/15
 * Time: 11:22
 * To change this template use File | Settings | File Templates.
 */

define(['./views/header-view',
    './views/homepage-view',
    './views/search-results-view',
    './views/search-result-card-item-view',
    './views/search-box-view',
    './views/query-item-view',
    './views/queries-list-view',
    './views/searchpage-view', './views/favourites-list-view' ,'./views/favourite-item-view'],
        function (HeaderView,
                HomePageView,
                SearchResultsView,
                SearchResultCardItemView,
                SearchBoxView,
                QueryItemView,
                QueryListView,
                SearchPageView,
                FavouritesListView,
                FavouriteItemView) {

            var views = {
                HeaderView: HeaderView,
                HomePageView: HomePageView,
                SearchResultsView: SearchResultsView,
                SearchResultCardItemView: SearchResultCardItemView,
                SearchBoxView: SearchBoxView,
                QueryItemView: QueryItemView,
                QueryListView: QueryListView,
                SearchPageView: SearchPageView,
                FavouritesListView: FavouritesListView,
                FavouriteItemView:FavouriteItemView
            }

            return views;
        });