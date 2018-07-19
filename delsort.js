//<nowiki>
( function ( $, mw ) {
    mw.loader.load( "jquery.chosen" );
    mw.loader.load( "mediawiki.ui.input", "text/css" );

    var delsortCategories = {
        "People": ["People", "Academics and educators", "Actors and filmmakers", "Artists", "Authors", "Bands and musicians", "Businesspeople", "Politicians", "Sportspeople", "Women", "Lists of people"],
        "Arts": ["Arts", "Fictional elements", "Science fiction"],
        "Arts/Culinary": ["Food and drink", "Wine"],
        "Arts/Language": ["Language", "Academic journals", "Bibliographies", "Journalism", "Literature", "Logic", "News media", "Philosophy", "Poetry"],
        "Arts/Performing": ["Albums and songs", "Dance", "Film", "Magic", "Music", "Radio", "Television", "Theatre", "Video games"],
        "Arts/Visual arts": ["Visual arts", "Architecture", "Fashion", "Photography"],
        "Arts/Comics and animation": ["Comics and animation", "Anime and manga", "Webcomics"],
        "Places of interest": ["Museums and libraries", "Shopping malls"],
        "Topical": ["Animal", "Bilateral relations", "Business", "Conservatism", "Conspiracy theories", "Crime", "Disability", "Discrimination", "Ethnic groups", "Events", "Games", "Health and fitness", "History", "Law", "Military", "Organizations", "Paranormal", "Piracy", "Politics", "Terrorism"],
        "Topical/Business": ["Business", "Advertising", "Companies", "Management", "Finance"],
        "Topical/Culture": ["Beauty pageants", "Fashion", "Mythology", "Popular culture", "Sexuality and gender"],
        "Topical/Education": ["Education", "Fraternities and sororities", "Schools"],
        "Topical/Religion": ["Religion", "Atheism", "Bible", "Buddhism", "Christianity", "Islam", "Judaism", "Hinduism", "Paganism", "Sikhism", "Spirituality"],
        "Topical/Science": ["Science", "Archaeology", "Astronomy", "Behavioural science", "Economics", "Environment", "Geography", "Mathematics", "Medicine", "Organisms", "Social science", "Transportation"],
        "Topical/Sports": ["Sports", "American football", "Baseball", "Basketball", "Bodybuilding", "Boxing", "Cricket", "Cycling", "Football", "Golf", "Horse racing", "Ice hockey", "Rugby union", "Softball", "Martial arts", "Wrestling"],
        "Topical/Technology": ["Technology", "Aviation", "Computing", "Firearms", "Internet", "Software", "Websites"],
        "Wikipedia page type": ["Disambiguations", "Lists"],
        "Geographic/Africa": ["Africa", "Egypt", "Ethiopia", "Ghana", "Kenya", "Laos", "Mauritius", "Morocco", "Nigeria", "Somalia", "South Africa", "Zimbabwe"],
        "Geographic/Asia": ["Asia", "Afghanistan", "Bangladesh", "Bahrain", "Brunei", "Cambodia", "China", "Hong Kong", "India", "Indonesia", "Japan", "Korea", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "Pakistan", "Philippines", "Singapore", "South Korea", "Sri Lanka", "Taiwan", "Thailand", "Vietnam"],
        "Geographic/Asia/Central Asia": ["Central Asia", "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Turkmenistan", "Uzbekistan"],
        "Geographic/Asia/Middle East": ["Middle East", "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Libya", "Palestine", "Saudi Arabia", "Syria", "United Arab Emirates", "Yemen", "Qatar"],
        "Geographic/Europe": ["Europe", "Albania", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia (country)", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Jersey", "Kosovo", "Latvia", "Lithuania", "Luxembourg", "Macedonia", "Malta", "Moldova", "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "Yugoslavia"],
        "Geographic/Europe/United Kingdom": ["United Kingdom", "England", "Northern Ireland", "Scotland", "Wales"],
        "Geographic/Oceania": ["Oceania", "Antarctica", "Australia", "New Zealand"],
        "Geographic/Americas/Canada": ["Canada", "British Columbia", "Manitoba", "Nova Scotia", "Ontario", "Quebec", "Alberta"],
        "Geographic/Americas/Latin America": ["Latin America", "Caribbean", "South America", "Argentina", "Barbados", "Belize", "Bolivia", "Brazil", "Chile", "Colombia", "Cuba", "Ecuador", "El Salvador", "Guatemala", "Haiti", "Mexico", "Panama", "Paraguay", "Peru", "Puerto Rico", "Trinidad and Tobago", "Uruguay", "Venezuela", "Grenada"],
        "Geographic/Americas/USA": ["United States of America", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia (U.S. state)", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "Washington, D.C.", "West Virginia", "Wisconsin", "Wyoming"],
        "Geographic/Unsorted": ["Islands"]
    };
    var afdcCategories = { "m": "Media and music", "o": "Organization, corporation, or product", "b": "Biographical", "s": "Society topics", "w": "Web or Internet", "g": "Games or sports", "t": "Science and technology", "f": "Fiction and the arts", "p": "Places and transportation", "i": "Indiscernible or unclassifiable topic", "u": "Not sorted yet" };
    var ADVERTISEMENT = " ([[User:Enterprisey/delsort|assisted]])";

    var currentAfdcCat = "";
    var currentDelsortCategories = [];

    if ( mw.config.get( "wgPageName" ).indexOf("Wikipedia:Articles_for_deletion/") != -1 &&
         mw.config.get( "wgPageName" ).indexOf("Wikipedia:Articles_for_deletion/Log/") == -1) {
        var portletLink = mw.util.addPortletLink("p-cactions", "#", "Delsort", "pt-delsort", "Perform deletion sorting");
        $( portletLink ).click( function ( e ) {
            e.preventDefault();

            // Validation for new custom fields
            var validateCustomCat = function ( container ) {
                var categoryName = container.children( "input" ).first().val();
                $.getJSON(
                    mw.util.wikiScript("api"),
                    {
                        format: "json",
                        action: "query",
                        prop: "pageprops",
                        titles: "Wikipedia:WikiProject Deletion sorting/" + categoryName
                    }
                ).done( function ( data ) {
                    var setStatus = function ( status ) {
                        var text = "Not sure";
                        var imageSrc = "https://upload.wikimedia.org/wikipedia/commons/a/ad/Question_mark_grey.png";
                        switch( status ) {
                        case "d":
                            text = "Doesn't exist";
                            imageSrc = "https://upload.wikimedia.org/wikipedia/commons/5/5f/Red_X.svg";
                            break;
                        case "e":
                            text = "Exists";
                            imageSrc = "https://upload.wikimedia.org/wikipedia/commons/1/16/Allowed.svg";
                            break;
                        }
                        container.children( ".category-status" ).empty()
                            .append( $( "<img>", { "src": imageSrc,
                                "style": "padding: 0 5px; width: 20px; height: 20px" } ) )
                            .append( text );
                    };
                    if( data && data.query && data.query.pages ) {
                        if( data.query.pages.hasOwnProperty( "-1" ) ) {
                            setStatus( "d" );
                        } else {
                            setStatus( "e" );
                        }
                    } else {
                        setStatus( "n" );
                    }
                } );
            };

            // Define a function to add a new custom field, used below
            var addCustomField = function ( e ) {
                $( "<div>" )
                    .appendTo( "#delsort-td" )
                    .css( "width", "100%" )
                    .css( "margin", "0.25em auto" )
                    .append( $( "<input>" )
                             .attr( "type", "text" )
                             .addClass( "mw-ui-input mw-ui-input-inline custom-delsort-field" )
                             .change( function ( e ) {
                                 validateCustomCat( $( this ).parent() );
                             } ) )
                    .append( $( "<span>" ).addClass( "category-status" ) )
                    .append( " (" )
                    .append( $( "<img>", { "src": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Crystal_128_reload.svg",
                        "style": "width: 15px; height: 15px; cursor: pointer" } )
                             .click( function ( e ) {
                                 validateCustomCat( $( this ).parent() );
                             } ) )
                    .append( ")" )
                    .append( $( "<button>" )
                             .addClass( "mw-ui-button mw-ui-destructive mw-ui-quiet" )
                             .text( "Remove" )
                             .click( function () {
                                 $( this ).parent().remove();
                             } ) );
            };

            $( "#jump-to-nav" ).after(
'<div style="border: thin solid rgb(197, 197, 197); box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.25); border-radius: 3px; padding: 5px; position: relative;" id="delsort">' +
'  <div id="delsort-title" style="font-size: larger; font-weight: bold; text-align: center;">Select a deletion sorting category</div>' +
'  <table style="margin: 2em auto; border-collapse: collapse;" id="delsort-table">' +
'    <tr style="font-size: larger"><th>AFDC</th><th>DELSORT</th></tr>' +
'    <tr>' +
'      <td style="padding-right: 10px;">' +
'        <table id="afdc">' +
'        </table>' +
'      </td>' +
'      <td style="border-left: solid black thick; padding-left: 10px; vertical-align: top;" id="delsort-td">' +
'          <select multiple="multiple" data-placeholder="Select a deletion sorting category..."></select>' +
'          <button id="add-custom-button" class="mw-ui-button mw-ui-progressive mw-ui-quiet">Add custom</button>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'  <button style="position: absolute; top: 5px; right: 5px;" id="close-button" class="mw-ui-button mw-ui-destructive mw-ui-quiet">Close</button>' +
'</div>' );
            $( "#add-custom-button" ).click( addCustomField );
            $( "#close-button" ).click( function () { $( "#delsort" ).remove(); } );

            var afdcHtml = "";
            Object.keys( afdcCategories ).forEach( function ( code, i ) {
                if ( i % 2 === 0 ) afdcHtml += "<tr>";
                afdcHtml += "<td><input type='radio' name='afdc' value='" + code + "' id='afdc-" + code + "' /><label for='afdc-" + code + "'>" + afdcCategories[ code ] + "</label></td>";
                if ( i % 2 !== 0 ) afdcHtml += "</tr>";
            } );

            // If there are an odd number of AFDC cats, we need to close off the last row
            if ( Object.keys( afdcCategories ).length % 2 !== 0 ) afdcHtml += "</tr>";

            $( "#afdc" ).html( afdcHtml );

            // Build the deletion sorting categories
            $.each( delsortCategories, function ( groupName, categories ) {
                var group = $( "<optgroup>" )
                    .appendTo( "#delsort select" )
                    .attr( "label", groupName );
                $.each( categories, function ( index, category ) {
                    group.append( $( "<option>" )
                                  .val( category )
                                  .text( category )
                                  .addClass( "delsort-category" ) );
                } );
            } );

            getWikitext( mw.config.get( "wgPageName" ) ).done( function ( wikitext ) {
                autofillAfdc( wikitext );

                // Autofill the delsort box
                var DELSORT_RE = /:<small class="delsort-notice">(.+?)<\/small>/g;
                var DELSORT_LIST_RE = /\[\[Wikipedia:WikiProject Deletion sorting\/(.+?)\|.+?\]\]/;
                var delsortMatch;
                var delsortListMatch;
                do {
                    delsortMatch = DELSORT_RE.exec( wikitext );
                    if( delsortMatch !== null ) {
                        delsortListMatch = DELSORT_LIST_RE.exec( delsortMatch[1] );
                        if( delsortListMatch !== null ) {
                            currentDelsortCategories.push( delsortListMatch[1] );
                            var delsortOption = document.querySelector( "option.delsort-category[value='" + delsortListMatch[1] + "']" );
                            if( delsortOption ) {
                                delsortOption.selected = true;
                            }
                        }
                    }
                } while( delsortMatch );

                // Now that we've updated the underlying <select>, ask Chosen to
                // update the visible search box
                $( "#delsort select" ).trigger( "chosen:updated" );
            } );

            // Initialize the special chosen.js select box
            // (some code stolen from http://stackoverflow.com/a/27445788)
            $( "#delsort select" ).chosen();
            $( "#delsort .chzn-container" ).css( "text-align", "left" );

            // Add the button that triggers sorting
            $( "#delsort" ).append( $( "<div>" )
                    .css( "text-align", "center" )
                    .append( $( "<button> ")
                        .addClass( "mw-ui-button" )
                        .addClass( "mw-ui-progressive" )
                        .attr( "id", "sort-button" )
                        .text( "Save changes" )
                        .click( function () {

                            // Make a status list
                            $( "#delsort" ).append( $( "<ul> ")
                                                    .attr( "id", "status" ) );

                            // Build a list of categories
                            var categories = $( "#delsort select" ).val() || [];
                            $( ".custom-delsort-field" ).each( function ( index, element ) {
                                categories.push( $( element ).val() );
                            } );
                            categories = categories.filter( Boolean ); // remove empty strings
                            categories = removeDups( categories );

                            // Only allow categories that aren't already there
                            var preCurrFilterLength = categories.length;
                            categories = categories.filter( function ( elem ) {
                                return currentDelsortCategories.indexOf( elem ) < 0;
                            } );
                            if( categories.length < preCurrFilterLength ) {
                                showStatus( ( preCurrFilterLength - categories.length ) +
                                    " " + ( preCurrFilterLength - categories.length === 1 ?
                                        "category was" : "categories were" ) +
                                    " already on the page, and thus not added" );
                            }
                            
                            // Obtain the target AFDC category, brought to you by http://stackoverflow.com/a/24886483/1757964
                            var afdcTarget = document.querySelector("input[name='afdc']:checked").value;
                            
                            // Actually do the delsort
                            saveChanges( categories, afdcTarget );
                        } ) ) );
        } );
    } // End if ( mw.config.get( "wgPageName" ).indexOf('Wikipedia:Articles_for_deletion/') ... )

    /*
     * Autofills the AFDC radio button group based on the current
     * page's wikitext
     */
    function autofillAfdc( wikitext ) {
        var regexMatch = /REMOVE THIS TEMPLATE WHEN CLOSING THIS AfD(?:\|(.*))?}}/.exec( wikitext );
        if ( regexMatch ) {
            var templateParameter = regexMatch[1];
            if ( templateParameter ) {
                currentAfdcCat = templateParameter;
                if ( templateParameter.length === 1 ) {
                    var currentClass = templateParameter.toLowerCase();
                    $( "#afdc-" + currentClass ).prop( "checked", true );
                }
            }
        }
    }

    /*
     * Saves the changes to the current discussion page by adding delsort notices (if applicable) and updating the AFDC cat
     */
    function saveChanges( cats, afdcTarget ) {
        var changingAfdcCat = currentAfdcCat.toLowerCase() !== afdcTarget;

        // Indicate to the user that we're doing some deletion sorting
        $( "#delsort-table" ).remove();
        $( "#delsort #sort-button" )
            .text( "Sorting " + ( changingAfdcCat ? "and categorizing " : "" ) + "discussion..." )
            .prop( "disabled", true )
            .fadeOut( 400, function () {
                $( this ).remove();
            } );
        var categoryTitleComponent = ( cats.length === 1 ) ? ( "the \"" + cats[0] + "\" category" ) : ( cats.length + " categories" );
        var afdcTitleComponent = changingAfdcCat ? " and categorizing it as " + afdcCategories[ afdcTarget ] : "";
        $( "#delsort-title" )
            .html( "Sorting discussion into " + categoryTitleComponent + afdcTitleComponent + "<span id=\"delsort-dots\"></span>" );

        // Start the animation, using super-advanced techniques
        var animationInterval = setInterval( function () {
            $( "#delsort-dots" ).text( $( "#delsort-dots" ).text() + "." );
            if( $( "#delsort-dots" ).text().length > 3 ) {
                $( "#delsort-dots" ).text( "" );
            }
        }, 600 );

        // Place (a) notification(s) on the discussion and update its AFDC cat
        var editDiscussionDeferred = postDelsortNoticesAndUpdateAfdc( cats, afdcTarget );

        // List the discussion at the DELSORT pages
        var deferreds = cats.map( listAtDelsort );

        // We still have to wait for the discussion to be edited
        deferreds.push( editDiscussionDeferred );

        // When everything's done, say something
        $.when.apply( $, deferreds ).then( function () {

            // Call the done hook
            if( window.delsortDoneHook ) {
                window.delsortDoneHook();
            }

            // We're done!
            $( "#delsort-title" )
                .text( "Done " + ( changingAfdcCat ? "updating the discussion's AFDC category and " : "" ) + "sorting discussion into " + categoryTitleComponent + "." );
            showStatus( "<b>Done!</b> " + ( changingAfdcCat ? "The discussion's AFDC was updated and it was" : "Discussion was" ) + " sorted into " + categoryTitleComponent + ". (" )
                .append( $( "<a>" )
                         .text( "reload" )
                         .attr( "href", "#" )
                         .click( function () { document.location.reload( true ); } ) )
                .append( ")" );
            clearInterval( animationInterval );
        } );
    }

    /*
     * Adds a new status to the status list, and returns the newly-displayed element.
     */
    function showStatus( newStatus ) {
        return $( "<li>" )
             .appendTo( "#delsort ul#status" )
             .html( newStatus );
    }

    /*
     * Adds some notices to the discussion page that this discussion was sorted.
     */
    function postDelsortNoticesAndUpdateAfdc( cats, afdcTarget ) {
        var changingAfdcCat = currentAfdcCat.toLowerCase() !== afdcTarget,
            deferred = $.Deferred(),
            statusElement = showStatus( "Updating the discussion page..." );

        getWikitext( mw.config.get( "wgPageName" ) ).done( function ( wikitext ) {
            try {
                statusElement.html( "Processing wikitext..." );

                // Process wikitext

                // First, add delsort notices
                wikitext += createDelsortNotices( cats );

                // Then, update the AFDC category
                var afdcMatch = wikitext.match( /REMOVE THIS TEMPLATE WHEN CLOSING THIS AfD/ );
                if ( afdcMatch && afdcMatch[ 0 ] ) {
                    var afdcMatchIndex = wikitext.indexOf( afdcMatch[ 0 ] ) + afdcMatch[ 0 ].length,
                        charAfterTemplateName = wikitext[ afdcMatchIndex ];
                    if ( charAfterTemplateName === "}" ) {
                        wikitext = wikitext.slice( 0, afdcMatchIndex ) + "|" + afdcTarget.toUpperCase() + wikitext.slice( afdcMatchIndex );
                    } else if ( charAfterTemplateName === "|" ) {
                        wikitext = wikitext.replace( "|" + currentAfdcCat + "}}", "|" + afdcTarget.toUpperCase() + "}}" );
                    }
                }

                statusElement.html( "Processed wikitext. Saving..." );

                var catPlural = ( cats.length === 1 ) ? "" : "s";
                $.ajax( {
                    url: mw.util.wikiScript( "api" ),
                    type: "POST",
                    dataType: "json",
                    data: {
                        format: "json",
                        action: "edit",
                        title: mw.config.get( "wgPageName" ),
                        summary: "Updating nomination page with notices" + ( changingAfdcCat ? " and new AFDC cat" : "" ) + ADVERTISEMENT,
                        token: mw.user.tokens.get( "editToken" ),
                        text: wikitext
                    }
                } ).done ( function ( data ) {
                    if ( data && data.edit && data.edit.result && data.edit.result == "Success" ) {
                        statusElement.html( cats.length + " notice" + catPlural + " placed on the discussion!" );
                        if ( changingAfdcCat ) {
                            if ( currentAfdcCat ) {
                                var formattedCurrentAfdcCat = currentAfdcCat.length === 1 ? afdcCategories[ currentAfdcCat.toLowerCase() ] : currentAfdcCat;
                                showStatus( "Discussion's AFDC category was changed from " + formattedCurrentAfdcCat + " to " + afdcCategories[ afdcTarget ] + "." );
                            } else {
                                showStatus( "Discussion categorized under " + afdcCategories[ afdcTarget ] + " with AFDC." );
                            }
                        }
                        deferred.resolve();
                    } else {
                        statusElement.html( "While editing the current discussion page, the edit query returned an error. =(" );
                        deferred.reject();
                    }
                } ).fail ( function() {
                    statusElement.html( "While editing the current discussion page, the AJAX request failed." );
                    deferred.reject();
                } );
            } catch ( e ) {
                statusElement.html( "While getting the current page content, there was an error." );
                console.log( "Current page content request error: " + e.message );
                deferred.reject();
            }
        } ).fail( function () {
            statusElement.html( "While getting the current content, there was an AJAX error." );
            deferred.reject();
        } );
        return deferred;
    }

    /*
     * Turns a list of delsort categories into a number of delsort template notice substitutions.
     */
    function createDelsortNotices( cats ) {
        var appendText = "";
        cats.forEach( function ( cat ) {
            appendText += "\n\{\{subst:Delsort|" + cat + "|\~\~\~\~\}\}";
        } );
        return appendText;
    }
    
    /*
     * Adds a listing at the DELSORT page for the category.
     */
    function listAtDelsort( cat ) {
        var deferred = $.Deferred();
        
        // Make a status element just for this category
        var statusElement = showStatus( "Listing this discussion at DELSORT/" +
                                        cat + "..." );

        // Clarify our watchlist behavior for this edit
        var allowedWatchlistBehaviors = ["watch", "unwatch", "preferences",
                "nochange"];
        var watchlistBehavior = "nochange"; // no watchlist change by default
        if( window.delsortWatchlist && allowedWatchlistBehaviors.indexOf(
                window.delsortWatchlist.toLowerCase() ) >= 0 ) {
            watchlistBehavior = window.delsortWatchlist.toLowerCase();
        }
        
        // First, get the current wikitext for the DELSORT page
        getWikitext( "Wikipedia:WikiProject Deletion sorting/" + cat ) .done( function ( wikitext ) {
            try {
                statusElement.html( "Got the DELSORT/" + cat + " listing wikitext, processing..." );
                
                // Actually edit the content to include the new listing
                var newDelsortContent = wikitext.replace("directly below this line -->", "directly below this line -->\n\{\{" + mw.config.get("wgPageName") + "\}\}");
                
                // Then, replace the DELSORT listing with the new content
                var listTitle = "Wikipedia:WikiProject Deletion sorting/" + cat;
                $.ajax( {
                    url: mw.util.wikiScript( "api" ),
                    type: "POST",
                    dataType: "json",
                    data: {
                        format: "json",
                        action: "edit",
                        title: listTitle,
                        summary: "Listing [[" + mw.config.get("wgPageName") + "]]" + ADVERTISEMENT,
                        token: mw.user.tokens.get( "editToken" ),
                        text: newDelsortContent,
                        watchlist: watchlistBehavior
                    }
                } ).done ( function ( data ) {
                    if ( data && data.edit && data.edit.result && data.edit.result == "Success" ) {
                        statusElement.html( "Listed page at <a href=" + mw.util.getUrl( listTitle ) + ">the " + cat + " deletion sorting list</a>!" );
                        deferred.resolve();
                    } else {
                        statusElement.html( "While listing at DELSORT/" + cat + ", the edit query returned an error. =(" );
                        deferred.reject();
                    }
                } ).fail ( function() {
                    statusElement.html( "While listing at DELSORT/" + cat + ", the ajax request failed." );
                    deferred.reject();
                } );
            } catch ( e ) {
                statusElement.html( "While getting the DELSORT/" + cat + " content, there was an error." );
                console.log( "DELSORT content request error: " + e.message );
                //console.log( "DELSORT content request response: " + JSON.stringify( data ) );
                deferred.reject();
            }
        } ).fail( function () {
            statusElement.html( "While getting the DELSORT/" + cat + " content, there was an AJAX error." );
            deferred.reject();
        } );
        return deferred;
    }

    /**
     * Gets the wikitext of a page with the given title (namespace required).
     */
    function getWikitext( title ) {
        return $.getJSON(
            mw.util.wikiScript("api"),
            {
                format: "json",
                action: "query",
                prop: "revisions",
                rvprop: "content",
                rvlimit: 1,
                titles: title
            }
        ).then( function ( data ) {
            var pageId = Object.keys(data.query.pages)[0];
            return data.query.pages[pageId].revisions[0]["*"];
        } );
    }

    /**
     * Removes duplicates from an array.
     */
    function removeDups( arr ) {
        var obj = {};
        for( var i = 0; i < arr.length; i++ ) {
            obj[arr[i]] = 0;
        }
        return Object.keys( obj );
    }
}( jQuery, mediaWiki ) );
//</nowiki>
