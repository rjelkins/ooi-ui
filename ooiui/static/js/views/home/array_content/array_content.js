// Parent class for asset views.
var ParentView = Backbone.View.extend({
    /* Parent class for views.
     *  - initialize()
     *  - render()
     *  - derender()
     */
    initialize: function(options) {
        _.bindAll(this, 'render', 'derender');
    },
    render: function() {
        if (this.model) {
            // we're using geoJSON here.  Make sure when you access the
            // object in the partial you are referencing the ArrayModel's .toGeoJSON() method
            // return, and not the actual model.
            // e.g. properties.description NOT this.model.attributes. . .
          // console.log('ParentView render');
          // console.log(this.model);
            this.$el.html(this.template(this.model.toGeoJSON()));
        } else {
            this.$el.html(this.template());
        }

        return this;
    },
    derender: function() {
        this.remove();
        this.unbind();
        this.model.off();
    }
});

var ArrayContentSummary = ParentView.extend({
    events: {
        'mouseenter .js-expand': '_highlightArray',
        'mouseleave .js-expand': '_lowlightArray',
        'mouseover tr': '_highlightPlatform',
        'mouseout tr': '_lowlightPlatform'
        //'click tr': '_getPlatformsStatus' // Dyanmically populate the nodes and instruments under the site
    },

    _getPlatformsStatus: function(event) {
      var self = this;
      var targetParent = ($(event.target).parent())[0];
      var innerTableRowId = 'innerTableRow_' + targetParent.getAttribute("data-code");

      // console.log('targetParent');
      // console.log(targetParent);
      // console.log('maybe fetch some platform status with the instrument status');

      self.collection.platformsStatusCollection.fetch({async: false, url: '/api/uframe/status/platforms/'+targetParent.getAttribute("data-code")}).done(function(collection){
        // console.log(collection);
        // console.log('getting platform status on demand');
        // console.log(self.collection.platformsStatusCollection);
        // var newRow = $("<tr id='test_view_insert'><td>Col1</td><td>Col2</td><td>Col3</td><td>Col4</td><td>Col5</td><td>Col6</td></tr>");


        // platformItems = collection.platforms;
        // platformItems.comparator = "depth";
        // platformItems.sort();
        _.forEach(collection.platforms, function(modelList) {
          var innerTableId = 'innerTable_' + modelList.header.code;
          var innerTableBannerId = 'innerTableBanner_' + modelList.header.code;

          var platformHeaderRow = $(
            '<tr id='+innerTableBannerId+'><td colspan="6">'+
            '<h4 class="" data-target=' + modelList.header.title + '<small class="refDesLabel">(' + modelList.header.title + ')</small><i class="fa fa-chevron-down pull-right"></i></h4>'+
            '</td></tr>'
          );
          // Add table header
          var newRow =$(
            '<tr id='+innerTableRowId+'><td colspan="6">'+
            // '<div class="panel">'+
            // '<div class="panel-heading">'+
            // '<h4 class="js-expand" data-target="'+modelList.header.code+'"'+modelList.header.title || modelList.header.code+'<small class="refDesLabel" style="display:none">'+(modelList.header.title)+' ? ('+ modelList.header.code + ') :""</small><i class="fa fa-chevron-down pull-right"></i></h4>'+
            // '</div>'+
            // '<div id="'+modelList.header.code+'" class="panel-body" style="display: none">'+
            '<table id='+innerTableId+' class="table table-default">'+
            '<thead>'+
            '<tr>'+
            '<th style="width: 75px;font-size: 10pt;">Navigation</th>'+
            '<th style="width: 300px;font-size: 10pt;"><div class="innerTableTitle">'+modelList.header.title+'</div><div style="vertical-align: bottom;font-size: 10pt;">Instrument</div></th>'+
            '<th style="width: 100px;font-size: 10pt;">Status</th>'+
            '<th style="width: 100px;font-size: 10pt;">Deployment Depth</th>'+
            '<th style="width: 175px;font-size: 10pt;">Start Time</th>'+
            '<th style="width: 175px;font-size: 10pt;">End Time</th>'+
            '</tr>'+
            '</thead>'+
            '</table>'+
            // '</div>'+
            // '</div>'+
            '</td></tr>'
          );
          // platformHeaderRow.insertAfter('#'+targetParent.getAttribute("data-code"));
          newRow.insertAfter('#'+targetParent.getAttribute("data-code"));

          _.forEach(modelList.items, function(model){
            // console.log(model);
            var piModel = new PlatformsInstrumentModel(model);
            // console.log('piModel');
            // console.log(piModel);
            var row = new StatusRow({
              model : piModel
            });
            // console.log('row');
            // console.log(row);

            self.$el.find("#"+ innerTableId).append(row.el);
          })
        });
      })

    },
    _highlightArray: function(event) {
        // console.log(event);
        var arrayIconHighlight = new L.divIcon({className: 'mydivicon-hover', iconSize: [20, 20]});
        var targetCode = ($(event.target).parent().parent())[0];
        _.each(map._layers, function(layer) {
            if(!_.isUndefined(layer.feature)) {
              // console.log(layer.feature.properties.code);
              if (layer._icon) {
                if (targetCode.id.indexOf(layer.feature.properties.code) > -1 || targetCode.outerHTML.indexOf(layer.feature.properties.code) > -1) {

                  layer.setIcon(arrayIconHighlight);
                }
              }
            }
        });
    },
    _lowlightArray: function(event) {
        // console.log(event);
        var arrayIcon = new L.divIcon({className: 'mydivicon', iconSize: [20, 20]});
        var targetCode = ($(event.target).parent().parent());

        _.each(map._layers, function(layer) {
            if(!_.isUndefined(layer.feature)) {
              // console.log(layer.feature.properties.code);
              if (layer._icon) {
                if (layer.feature.properties.code.indexOf(targetCode[0].id) > -1) {
                  layer.setIcon(arrayIcon);
                }
              }
            }
        });
    },
    _highlightPlatform: function(event) {
        var platIconHighlight = new L.divIcon({className: 'mydivicon-platform-hover', iconSize: [20, 20]});
        var targetGrandParent = ($(event.target).parent().parent())[0];
        var targetParent = ($(event.target).parent())[0];
        _.each(map._layers, function(layer) {
            if(!_.isUndefined(layer.feature)) {
              // console.log(layer.feature.properties.code);
              if (layer._icon) {
                if (targetParent.getAttribute("data-code") == layer.feature.properties.code || targetGrandParent.getAttribute("data-code") == layer.feature.properties.code && layer.feature.properties.code.length > 2) {
                  layer.setIcon(platIconHighlight);
                }
              }
            }
        });
    },
    _lowlightPlatform: function(event) {
        var platIconLowLight = new L.divIcon({className: 'mydivicon-platform', iconSize: [20, 20]});
        var targetCode = ($(event.target).parent().parent());

        var targetGrandParent = ($(event.target).parent().parent())[0];
        var targetParent = ($(event.target).parent())[0];
        _.each(map._layers, function(layer) {
            if(!_.isUndefined(layer.feature)) {
              // console.log(layer.feature.properties.code);
              if (layer._icon && targetParent.getAttribute("data-code")) {

                if (layer.feature.properties.code.indexOf(targetCode[0].id) > -1) {
                  layer.setIcon(platIconLowLight);
                }

              }
            }
        });
    },
  render: function() {
    var arrayContentContext = this;
    var sitesWithErrors = [];
    // console.log('arrayContentContext');
    // console.log(arrayContentContext);

    //console.log('arrayCollection');
    //console.log(this.collection.arrayCollection);

    var arrayContentSummaryItem = this.collection.arrayCollection.map(function(model) {
      // lets get all the platforms for this particular array...
        /* var platforms = arrayContentContext
         .collection
         .platformCollection
         .byArray(model.attributes.array_code);*/
      //var siteStatusCollection = new SiteStatusCollection();
      arrayContentContext.collection.siteStatusCollection.fetch({timeout: 500, async: false, url: '/api/uframe/status/sites/'+model.attributes.reference_designator}).done(function() {
        arrayContentContext.collection.siteStatusCollection.sortByField('depth','ascending');
          // console.log('arrayContentContext.collection.siteStatusCollection.toGeoJSON()');
          // console.log(arrayContentContext.collection.siteStatusCollection.toGeoJSON());
        var siteGeoJSON = arrayContentContext.collection.siteStatusCollection.toGeoJSON();
          model.set({platforms: siteGeoJSON});
          if(siteGeoJSON == null || siteGeoJSON.length == 0){
              sitesWithErrors.push(model.attributes.display_name + ' (' + model.attributes.reference_designator + ')')
          }

      });
        //model.set({platforms: model.toGeoJSON().properties.platforms});

        //console.log('render arrays');
        //console.log(model);
        // console.log('model before');
        // console.log(model);

      return (new ArrayContentSummaryItem({model: model})).render().el;
      });


    // $(window).resize(function () {
    //   map._setArrayView();
    // });

    //map._setMaxBounds(sw, ne);



    // console.log('arrayContentSummaryItem');
    // console.log(arrayContentSummaryItem);
    // console.log('arrayContentContext.$el');
    // console.log(arrayContentContext.$el);

    // TODO: Maybe use something like this down the road for the admin panel.
/*    if(sitesWithErrors.length > 0){
      var daWarning = new ModalDialogView();
      var theMessage = "<div style='font-size: 16px;text-align:center;padding-top: 10px;'>";
      theMessage += "Error retrieving site data from uframe for site(s):";
      _.each(sitesWithErrors, function(theSite){
        theMessage += "<p>" + theSite + "</p>";
      });
      theMessage += "</div>";
      daWarning.show({
        message: theMessage,
        type: "warning"
      });
    }*/

    // prepend the arrays to the page.
    setTimeout(function() {
      arrayContentContext.$el.prepend(arrayContentSummaryItem);
      $('.js-expand').css({height: Math.floor(vph/arrayContentContext.collection.arrayCollection.length) -
      2 * arrayContentContext.collection.arrayCollection.length + 'px'});
    }, 300);
  }
});

var ArrayContentSummaryItem = ParentView.extend({
    events: {
        'click .js-expand': '_flyFly',
        'click .js-view-subsite span': '_flyToSubsite'
        //'mouseover .js-platform-table tr': '_popUpForPlatform',
        //'click .js-platform-table tr': '_goToPlatform',
    },
    _flyToSubsite: function(event) {
        var target = $(event.target),
            lat = target.data('lat').toString(),
            lng = target.data('lon').toString();

        if (this.activePlatform === target.attr('id')) {
            this.activePlatform = undefined;
            // map.setLayoutProperty('ceArray', 'visibility', 'none');
            // map.setLayoutProperty('rsMoorings', 'visibility', 'none');
            map.setView([45.769225,-128.804111], 5);
        } else {
            this.activePlatform = target.attr('id');

            // map.setLayoutProperty('rsMoorings', 'visibility', 'visible');
            map.setView([lat, lng]);
        }
    },
    _popUpForPlatform: _.debounce(function(event) {
        event.stopImmediatePropagation();
        var title = $(event.target).parent().data('title'),
            lat = $(event.target).parent().data('lat'),
            lon = $(event.target).parent().data('lon');


        // CE
        if ($(event.target).parent().data('title').indexOf('OR ') > -1 || $(event.target).parent().data('code').indexOf('CE05MOAS') > -1) {
            map.setView([44.6499, -124.6133]);
        }

        if ($(event.target).parent().data('title').indexOf('WA ') > -1) {
            map.setView([ 46.9798, -124.6269]);
        }

        // RS
        if ($(event.target).parent().data('title').indexOf('Axial') > -1) {
            map.setView([45.900, -130.055]);
        }

        if ($(event.target).parent().data('title').indexOf('Continental') > -1) {
            map.setView([44.5028, -125.3707]);
        }

        this._addPopup([lon, lat], title);
    }, 100),
    _goToPlatform: function(event) {
        event.stopImmediatePropagation();

        var code = $(event.target).parent().data('code');
        window.open("/platform?id="+code);

    },
    // _flyBye and flyFly are controls that interact directly with the global map variable.
    // because of this, the ArrayContentSummary Item is tightly coupled to the VectorMap
    _toggleActive: function(event) {
        var el = $('#'+this.model.attributes.reference_designator);
        //toggle current one class
        // console.log('toggle active');
        // console.log(el);
        el.toggleClass('active');

        //remove any existing actives
        if ($( ".js-array" ).not(el).hasClass('active')) {
            $( ".js-array" ).not(el).removeClass('active');
        }
    },
    _toggleOthers: function(event) {
        var el = $('#'+this.model.attributes.reference_designator),
            arrayEl = $('.js-array');

        _.each(arrayEl, function(item) {
            var id = $(item).attr('id'),
                elId = el.attr('id');

            if (id !== elId) {
                $(item).animate({
                    opacity: 'toggle',
                    height: 'toggle'
                }, 500);
            }
        });
    },
    _flyBye: function() {
        // map.setLayoutProperty('rsArray', 'visibility', 'visible');
        // map.setLayoutProperty('ceArray', 'visibility', 'visible');
        map._hidePlatformView();

        //popup.remove();

        // Set the map back to the array view
        map._isArrayView = true;
        map.setView([5.7, -94], 2.59);
        // map.whenReady(function() {
        //     var currentMapBounds = map.getBounds();
        //     map.setMaxBounds(currentMapBounds);
        // });

        // when resetting the page, change the title back to 'Home'
        bannerTitle = 'Home';
        banner.changeTitle({bannerTitle});
    },
    _addPopup: function(loc, name) {
        popup.setLngLat(loc)
        .setHTML('<span>' +name+'</span>')
        .addTo(map);
    },
    _flyFly: _.debounce(function(event) {
        var flyFlyContext = this;

              if(map._isArrayView) {
                map._showPlatformView();
                map._isArrayView = false;
              }else{
                  map._hidePlatformView();
                  map._isArrayView = true;
              }
          event.stopImmediatePropagation();
          //flyFlyContext.originalZoom;
          // console.log('flyFlyContext.model.attributes.reference_designator');
          // console.log(flyFlyContext.model.attributes.reference_designator);

          $.when(this._toggleActive(event)).done(function () {
            $.when(flyFlyContext._toggleOthers(event)).done(function () {
              var el = $('#' + flyFlyContext.model.attributes.reference_designator),
                table = '#' + el.attr('id') + ' > .js-platform-table';
              $(table).slideToggle();

              // give the impression that the page has changed, change the title.
              bannerTitle = flyFlyContext.model.attributes.display_name;
              banner.changeTitle({bannerTitle});
            });
          });

          // helper monkies

            /* @private _compareGeoLoc
             * Given Point 1 (pt1), return bool if between a RANGE centered at Point 2 (pt2).
             *
             * @private _addPopup
             * Adds the global popup variable with HTML to the global map variable.
             */

          var _compareGeoLoc = (function (pt1, pt2) {
            var RANGE = 10;

            var isLngGreater = Math.round(pt1.lng) > Math.round(pt2[1]) - RANGE;
            var isLngLess = Math.round(pt1.lng) < Math.round(pt2[1]) + RANGE;
            var isPt1LngBetweenPt2Lng = isLngGreater && isLngLess;

            var isLatGreater = Math.round(pt1.lat) > Math.round(pt2[0]) - RANGE;
            var isLatLess = Math.round(pt1.lat) < Math.round(pt2[0]) + RANGE;
            var isPt1LatBetweenPt2Lat = isLatGreater && isLatLess;

            return ((isPt1LngBetweenPt2Lng) && (isPt1LatBetweenPt2Lat)) ? true : false;
          });

          // end helper monkies

          // map._setPlatformView();
          var loc = [
              flyFlyContext.model.attributes.latitude,
              flyFlyContext.model.attributes.longitude
            ],
            code = flyFlyContext.model.attributes.reference_designator,
            name = flyFlyContext.model.attributes.display_name;


      if(!map._isArrayView) {


          if (code === 'CE') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            // map.setLayoutProperty('rsArray', 'visibility', 'none');
            map.setView([loc[0] + 1.8, loc[1]], 7);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          } else if (code === 'RS') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            // map.setLayoutProperty('ceArray', 'visibility', 'none');
            map.setView([loc[0] + 1, loc[1] - 1], 7);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          } else if (code === 'CP') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            map.setView([loc[0], loc[1]], 8);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          } else if (code === 'GS') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            map.setView([loc[0], loc[1]], 6);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          } else if (code === 'GI') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            map.setView([loc[0], loc[1]], 7);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          } else if (code === 'GA') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            map.setView([loc[0], loc[1]], 6);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          } else if (code === 'GP') {
            // if ( !_compareGeoLoc(map.getCenter(), loc) ) {
            //     flyFlyContext.originalZoom = map.getZoom();
            // map.setLayoutProperty('rsArray', 'visibility', 'none');
            // map.setLayoutProperty('ceArray', 'visibility', 'none');
            map.setView([loc[0], loc[1]], 6);
            // } else {
            //     this._flyBye(flyFlyContext.originalZoom);
            // }
          }


          // map.whenReady(function() {
            var west = map.getBounds().getWest()-.2;
            var east = map.getBounds().getEast()+.2;
            var south = map.getBounds().getSouth()-.2;
            var north = map.getBounds().getNorth()+.2;
            var sw = L.latLng(south, west),
                ne = L.latLng(north, east),
              currentMapBounds = L.latLngBounds(sw, ne);
            // map.setMaxBounds(currentMapBounds);
            // });


        }else{
            this._flyBye();
        }


    }, 500, true),
    template: JST['ooiui/static/js/partials/home/array_content/ArrayContentSummaryItem.html']
});
