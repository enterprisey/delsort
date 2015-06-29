//<nowiki>
( function ( $, mw ) {
        mw.loader.load( "jquery.chosen" );
        mw.loader.load( "mediawiki.ui.input", "text/css" );

        var delsortCategories = {
                "Geographic": ["United States of America", "New York", "California", "United Kingdom", "England", "India", "Australia"],
                "Arts": ["Film", "Fictional elements", "Music", "Television", "Albums and songs"],
                "People": ["People", "Academics and educators", "Actors and filmmakers", "Authors", "Bands and musicians", "Businesspeople", "Politicians", "Sportspeople"],
                "Technology": ["Software", "Internet", "Websites"],
                "Miscellaneous": ["Organizations", "Football", "Martial arts", "Christianity", "Business"]
        };
    var ADVERTISEMENT = " ([[User:APerson/delsort|delsort.js]])";

    if (wgPageName.indexOf('Wikipedia:Articles_for_deletion/') != -1 &&
        wgPageName.indexOf('Wikipedia:Articles_for_deletion/Log/201') == -1) {
        var portletLink = mw.util.addPortletLink('p-cactions', '#', 'Delsort', 'pt-delsort', 'Perform deletion sorting');
        $( portletLink ).click( function ( e ) {
                e.preventDefault();

                // Define a function to add a new custom field, used below
                var addCustomField = function ( e ) {
                        $( "<div>" )
                            .insertBefore( "#delsort #sort-button" )
                            .css( "width", "40%" )
                            .css( "margin", "0.25em auto" )
                        .append( $( "<input>" )
                            .attr( "type", "text" )
                            .addClass( "mw-ui-input mw-ui-input-inline custom-delsort-field" ) )
                        .append( $( "<button>" )
                            .addClass( "mw-ui-button mw-ui-destructive mw-ui-quiet" )
                            .text( "Remove" )
                            .click( function ( e ) {
                                $( this ).parent().remove();
                            } ) );
                };

                $( "#jump-to-nav" ).after( $( "<div>" )
                    .attr( "id", "delsort" )
                    .css( "border", "thin solid #c5c5c5" )
                    .css( "box-shadow", "0 3px 8px rgba(0, 0, 0, .25)" )
                    .css( "border-radius", "3px" )
                    .css( "padding", "5px" )
                    .css( "position", "relative" )
                    .append( $( "<div>" )
                        .text( "Select a deletion sorting category" )
                        .css( "font-size", "larger" )
                        .css( "font-weight", "bold" )
                        .css( "text-align", "center" )
                        .attr( "id", "delsort-title") )
                    .append( $( "<div>" ) // this is disgusting but it works somehow
                        .css( "width", "100%" )
                        .append( $( "<div>" ) // yes, that is yet another div
                            .css( "text-align", "center" )
                            .css( "margin", "0.5em 0" )
                            .append( $( "<select>" )
                                .attr( "data-placeholder",
                                       "Select a deletion sorting category..." )
                                .attr( "multiple", "true" ) )
                            .append( $( "<button>" )
                                .addClass( "mw-ui-button mw-ui-progressive mw-ui-quiet" )
                                .text( "Add custom" )
                                .click( addCustomField ) ) ) )
                    .append( $( "<button>" )
                        .addClass( "mw-ui-button mw-ui-destructive mw-ui-quiet" )
                        .css( "position", "absolute" )
                        .css( "top", "5px" )
                        .css( "right", "5px" )
                        .text( "Close" )
                        .click( function ( e ) {
                                $( "#delsort" ).remove();
                        } ) ) );
                $.each( delsortCategories, function ( groupName, categories ) {
                        var group = $( "<optgroup>" )
                            .appendTo( "#delsort select" )
                            .attr( "label", groupName );
                        $.each( categories, function ( index, category ) {
                                group.append( $( "<option>" )
                                    .val( category )
                                    .text( category ) );
                        } );
                } );

            // Set up the chosen one (some code stolen from http://stackoverflow.com/a/27445788)
            $( "#delsort select" ).chosen();
            $( "#delsort .chzn-container" ).css( "text-align", "left" );

                // Add the button that triggers sorting
                $( "#delsort" ).append( $( "<div>" )
                    .css( "text-align", "center" )
                    .append( $( "<button> ")
                        .addClass( "mw-ui-button" )
                        .addClass( "mw-ui-progressive" )
                        .attr( "id", "sort-button" )
                        .text( "Sort deletion discussion" )
                        .click( function ( e ) {

                                // Make a status list
                                $( "#delsort" ).append( $( "<ul> ")
                            .attr( "id", "status" ) );

                                // Build a list of categories
                                var categories = $( "#delsort select" ).val();
                                $( ".custom-delsort-field" ).each( function ( index, element ) {
                                        categories.push( $( element ).val() );
                                } );
                                categories = categories.filter( Boolean ); // remove empty strings

                                // Actually do the delsort
                            delsortAll( categories );
                        } ) ) );
        } );
    }

    function delsortAll( cats ) {

        // Indicate to the user that we're doing some deletion sorting
        $( "#delsort .chzn-container" ).parent().remove();
        $( ".custom-delsort-field" ).parent().remove();
        $( "#delsort #sort-button" )
            .text( "Sorting discussion..." )
            .prop( "disabled", true )
            .fadeOut( 400, function () {
                $( this ).remove();
            } );
        var titleCategory = ( cats.length === 1 ) ? ( "the \"" + cats[0] + "\" category" ) : ( cats.length + " categories" );
        $( "#delsort-title" )
            .html( "Sorting discussion into " + titleCategory + "<span id=\"delsort-dots\"></span>" );

        // Start the animation, using super-advanced techniques
        var animationInterval = setInterval( function () {
                $( "#delsort-dots" ).text( $( "#delsort-dots" ).text() + "." );
                if( $( "#delsort-dots" ).text().length > 3 ) {
                        $( "#delsort-dots" ).text( "" );
                }
        }, 600 );

        // Place (a) notification(s) on the discussion
        var notificationDeferred = postDelsortNotices( cats );

        // List the discussion at the DELSORT pages
        var deferreds = cats.map( listAtDelsort );

        // We still have to wait for notifications to be placed
        deferreds.push( notificationDeferred );

        // When everything's done, say something
        $.when.apply( $, deferreds ).then( function () {

                // We're done!
                $( "#delsort-title" )
                    .text( "Done sorting discussion into " + titleCategory + "." );
                showStatus( "<b>Done!</b> Discussion sorted into " + titleCategory + ". (" )
                    .append( $( "<a>" )
                        .text( "reload" )
                        .attr( "href", "#" )
                        .click( function () { document.location.reload( true ); } ) )
                    .append( ")" );
                clearInterval( animationInterval );
        } );
    }

    function showStatus( newStatus ) {
        return $( "<li>" )
             .appendTo( "#delsort ul#status" )
             .html( newStatus );
    }

    /*
     * Adds some notices to the discussion page that this discussion was sorted.
     */
    function postDelsortNotices( cats ) {
        var deferred = $.Deferred();

        // Build a notification string
        var appendText = "";
        cats.forEach( function ( cat ) {
                appendText += "\n\{\{subst:Delsort|" + cat + "|\~\~\~\~\}\}";
        } );

        // Post the notice to the discussion
        var catPlural = ( cats.length === 1 ) ? "" : "s";
        $.ajax( {
            url: mw.util.wikiScript( 'api' ),
            type: 'POST',
            dataType: 'json',
            data: {
                format: 'json',
                action: 'edit',
                title: mw.config.get( 'wgPageName' ),
                summary: "Placing notification for listing at [[WP:DELSORT]]" + ADVERTISEMENT,
                token: mw.user.tokens.get( 'editToken' ),
                appendtext: appendText
            }
        } ).done ( function ( data ) {
            if ( data && data.edit && data.edit.result && data.edit.result == 'Success' ) {
                showStatus( cats.length + " notice" + catPlural + " placed on the discussion!" );
                deferred.resolve();
            } else {
                showStatus( "While placing " + cats.length + " notification" + catPlural + ", the edit query returned an error. =(" );
                deferred.reject();
            }
        } ).fail ( function() {
            showStatus( "While placing " + cats.length + " notification" + catPlural + ", the AJAX request failed." );
            deferred.reject();
        } );
        return deferred;
    }
    
    /*
     * Adds a listing at the DELSORT page for the category.
     */
    function listAtDelsort( cat ) {
        var deferred = $.Deferred();
        
        // Make a status element just for this category
        var statusElement = showStatus( "Listing this discussion at DELSORT/" +
                                        cat + "..." ); 
        
        // First, get the current wikitext for the DELSORT page
        var wikitext;
        $.getJSON(
            mw.util.wikiScript('api'),
            {
                format: 'json',
                action: 'query',
                prop: 'revisions',
                rvprop: 'content',
                rvlimit: 1,
                titles: "Wikipedia:WikiProject Deletion sorting/" + cat
            }
        ).done( function ( data ) {
            try {
                var pageId = Object.keys(data.query.pages)[0];
                wikitext = data.query.pages[pageId].revisions[0]['*'];
                
                statusElement.html( "Got the DELSORT/" + cat + " listing wikitext, processing..." );
                
                // Actually edit the content to include the new listing
                var newDelsortContent = wikitext.replace('directly below this line -->', 'directly below this line -->\n\{\{' + mw.config.get('wgPageName') + '\}\}');
                
                // Then, replace the DELSORT listing with the new content
                var listTitle = 'Wikipedia:WikiProject Deletion sorting/' + cat;
                $.ajax( {
                    url: mw.util.wikiScript( 'api' ),
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        format: 'json',
                        action: 'edit',
                        title: listTitle,
                        summary: "Listing [[" + mw.config.get('wgPageName') + "]]" + ADVERTISEMENT,
                        token: mw.user.tokens.get( 'editToken' ),
                        text: newDelsortContent
                    }
                } ).done ( function ( data ) {
                    if ( data && data.edit && data.edit.result && data.edit.result == 'Success' ) {
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
                console.log( "DELSORT content request response: " + JSON.stringify( data ) );
                deferred.reject();
            }
        } ).fail( function () {
            statusElement.html( "While getting the DELSORT/" + cat + " content, there was an AJAX error." );
            deferred.reject();
        } );
        return deferred;
    }
}( jQuery, mediaWiki ) );
//</nowiki>
