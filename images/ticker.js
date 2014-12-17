/* 4e07daba1460b15a74c47a12f30b71a5a74cec77/common/scripts/convertJSONtoAd.js */
convertJSONtoAd = function (imgTarget, linkText, trailText, sponJSON, title, slot, titleContainer, links) {
	if (sponJSON && typeof(sponJSON) === 'object') {
		imgTarget.attr('src', sponJSON.ad.image).attr('alt', sponJSON.ad['alt-image-text']).parent().attr('href', sponJSON.ad.link);
		linkText.attr('href', sponJSON.ad.link).text(sponJSON.ad.linkText);
		trailText.text(sponJSON.ad.description);
		if (sponJSON.ad.title) {
			title.text(sponJSON.ad.title);
		}
		jQ('.json-features.' + slot).show();
		if ( titleContainer ) {
			titleContainer[ sponJSON.ad.showjobstitle === 'false' ? 'hide' : 'show' ]();
		}
		if ( links && links.length ) {
			links[ sponJSON.ad.removetracking === 'true' ? 'addClass' : 'removeClass' ]( 'no-omni-tracking' );
		}
	}
};
/* 4e07daba1460b15a74c47a12f30b71a5a74cec77/common/scripts/guardian.geolocation.js */
/* GeoLocation 1.0 */

/** @namespace */
guardian = guardian || {};
(function (jQuery) {

    var url = "http://guardian-geo-location.appspot.com/geo-location";

    function GeoLocation() {
    }

    GeoLocation.cached = null;

    GeoLocation.prototype.getCachedGeoCode = function () {
        if (window.sessionStorage) {
            return sessionStorage.getItem("geoLocation_countryCode");
        } else {
            return this.cached;
        }
    };

    GeoLocation.prototype.setCachedGeoCode = function (countryCode) {
        if (window.sessionStorage) {
            sessionStorage.setItem("geoLocation_countryCode", countryCode);
        } else {
            this.cached = countryCode;
        }
    };

    GeoLocation.prototype.getGeoCode = function () {

        if (this.getCachedGeoCode()) {
            return jQuery.Deferred()
                .resolve(this.getCachedGeoCode())
                .promise();
        }

        var promise = jQuery.ajax({
            url:url,
            dataType:'jsonp',
            jsonpCallback: 'geolocation',
            cache: true
        });
        promise.then(jQuery.proxy(this.setCachedGeoCode, this));
        return promise;

    };

    GeoLocation.prototype.init = function () {

        var dataOnlyInCountry = jQuery("[data-only-in-country]");

        if (!dataOnlyInCountry.length) {
            return;
        }

        this.getGeoCode().then(function (actualCountryCode) {

            dataOnlyInCountry.each(function (i, obj) {

                var jObj = jQuery(obj),
                    expectedCountryCode = jObj.attr("data-only-in-country");

                if (expectedCountryCode.toUpperCase() !== actualCountryCode.toUpperCase()) {
                    jObj.closest(".embed").remove();
                }

            });

        });

    };

    guardian.GeoLocation = GeoLocation;

    jQuery(function() {
        new guardian.GeoLocation().init();
    })

})(jQuery);
/* 4e07daba1460b15a74c47a12f30b71a5a74cec77/common/scripts/guardian.r2.OmnitureTracking.js */
/*
 *  Written by Matt Andrews
 *
 *  Requires Omniture tracking
 *  Use as follows:
 *
 <a href="#" class="tracking-link">click me</a>

 var omniture = {
 "evars":
 [{
 "key": "37",
 "value": "Books:Carousel:Latest Reader Review"
 },
 {
 "key": "32",
 "value": "Books:Carousel:Something Else"
 }],

 "props":
 [{
 "key": "11",
 "value": "23 results found"
 }],

 "events":
 [{
 "id": "11"
 },
 {
 "id": "44"
 } ]
 }

 jQ(document).ready(function(){
 jQ('a.tracking-link').click(function(){
 track(omniture);
 });
 });
 *
 * */
ensurePackage('guardian.r2');
guardian.r2.OmnitureTracking = function track(omniture) {

    if (guardian.r2.omniture.isAvailable()) {
        var i = 0, len = 0;

        // first gather eVars and linkTrackVars
        if (omniture.evars) {
            var num_evars = omniture.evars.length;
            var evar_key_list = [];
            var evar_value_list = [];

            for (i = 0, len = omniture.evars.length; i < len; i++) {
                if (omniture.evars.hasOwnProperty(i)) {
                    var evar = omniture.evars[i];

                    // first build up array of keys
                    if (i < num_evars - 1) {
                        evar_key_list[i] = 'eVar' + evar.key;
                        evar_value_list[i] = evar.value;

                        // if we're on the last item, add it to the array
                        // then *optionally* add the events var if events are set
                        // (this avoids looping through the evars a second time)
                        // todo: work out why i thought this was a good idea
                    } else {
                        evar_key_list[i] = 'eVar' + evar.key;
                        evar_value_list[i] = evar.value;

                        if (omniture.events) {
                            var c = parseInt(i, 10) + 1; // avoid overwriting the current eVar
                            evar_key_list[c] = 'events';
                        }

                        // turn the array into a string
                        var linkTrackVars = evar_key_list.join(",");
                        s.linkTrackVars = linkTrackVars;

                        // now create the evars themselves
                        for (var j, j_len = evar_key_list.length; j < j_len; j++) {
                            if (evar_key_list[j] !== 'events') { // we add this one later
                                s[evar_key_list[j]] = evar_value_list[j];
                            }
                        }
                    }
                }
            }

        }
        // now gather events
        if (omniture.events) {
            var events_list = [];

            for (i = 0, len = omniture.events.length; i < len; i++) {
                if (omniture.events.hasOwnProperty(i)) {
                    events_list[i] = 'event' + omniture.events[i].id;
                }
            }

            // now set the events variable
            var events = events_list.join(",");
            s.linkTrackEvents = events;
            s.events = events;

        }

        // and finally the props
        if (omniture.props) {
            for (i, len = omniture.props.length; i < len; i++) {
                if (omniture.props.hasOwnProperty(i)) {
                    var prop = omniture.props[i];
                    s['prop' + prop.key] = prop.value;
                }
            }
        }

        s.tl(true, 'o', omniture.description);
    }

    // IT LIVES!!!
    //console.log(s);

};



guardian.r2.OmnitureTracking.setAdditionalPageProperties = function(opts) {
    guardian.r2.OmnitureTracking.contentType = opts.contentType;

    // Banner counter
    var bannerCount = (OAS_listpos) ? OAS_listpos.split(',').length : 0;
    if (bannerCount > 0) {
        s.eVar69 = "+" + bannerCount;
        s.events = s.apl(s.events, "event25=" + bannerCount, ',');
    }

    // More meta data for content pages
    if (opts.isContentPage === true && opts.contentType != "Network Front") {

        // Time elapsed since publication
        var elapsedStr = '',
            elapsedSec = (new Date() - Date.parse(opts.published)) / 1000,
            months  = Math.floor(elapsedSec / (86400 * 30)),
            days    = Math.floor((elapsedSec - (months * 86400 * 30)) / 86400),
            hours   = Math.floor((elapsedSec - (months * 86400 * 30) - (days * 86400)) / 3600),
            minutes = Math.floor((elapsedSec - (months * 86400 * 30) - (days * 86400) - (hours * 3600)) / 60);

        if (months) { elapsedStr += months + 'M '; }
        if (days)   { elapsedStr += days + 'd '; }
        if (elapsedSec >= 3600) { elapsedStr += hours + 'h '; }
        elapsedStr += minutes + 'm';

        s.prop48 = elapsedStr; // Time since publication
        s.eVar70 = '+1';
        s.events = s.apl(s.events, 'event41', ',');
    }
};

guardian.r2.OmnitureTracking.setProperty = function(propKey, propValue) {
    // This function is a simple setter to allow pages to set Omniture
    // properties before the s_code has loaded in
    if (typeof guardian.r2.OmnitureTracking._properties == 'undefined') {
        guardian.r2.OmnitureTracking._properties = {};
    }

    guardian.r2.OmnitureTracking._properties[propKey] = propValue;
};

guardian.r2.OmnitureTracking.applyProperties = function() {
    // This gets called before the s_code sends back data, applying any
    // additional props needed (LiveBlogs uses this)
    if (typeof guardian.r2.OmnitureTracking._properties != 'undefined') {
        jQ.each(guardian.r2.OmnitureTracking._properties, function(key, val) {
            s[key] = val;
        });
    }
};

guardian.r2.OmnitureTracking.enableComponentTracking = function() {


    jQ('body').delegate(".trackable-component a", "click", function(event){

        var link = jQ(this),
            container = link.parents('.trackable-component'),
            componentName = container.data('component'),
            isShareLinks = container.hasClass('share-links');

        if (componentName && isShareLinks) {
            // Share links are tracked a bit differently
            var shareLinkName = link.closest('[data-link-name]').data('link-name');
            guardian.r2.OmnitureTracking.trackSocialShare(shareLinkName, componentName);

        } else if (componentName) {
            // Otherwise track navigation as normal
            var linkName = link.closest('[data-link-name]').data('link-name');

            // Try to get position of this link, if in a list
            var liContainer = link.parents('li').last(),
                position = liContainer.index();

            if (position != -1 && componentName.indexOf('in body link') == -1) {
                componentName += ':Position' + (position+1);
            }

            linkName = linkName ? componentName + ':' + linkName : componentName;

            s.linkTrackVars = 'eVar7,eVar37,events';
            s.linkTrackEvents = 'event37';
            s.eVar37 = componentName;
            s.eVar7 = s.pageName;
            s.events = 'event37';

            var linkHref = link.attr('href');


            if (linkHref && (linkHref.indexOf('#') === 0 || linkHref.indexOf('javascript') === 0)) {
                // Track onpage clicks (ie: not leading to other pages)
                s.tl(true,'o',linkName);

            } else {
                // Otherwise, if this is a navigation link, and it doesn't have the opt-out class ('no-omni-tracking'), track it
                if ( !link.hasClass( 'no-omni-tracking' ) ) {
                    guardian.r2.OmnitureTracking.storeNavInteraction(link, linkName);
                }
            }


        }

    });
};


guardian.r2.OmnitureTracking.storeNavInteraction = function(linkNode, linkName) {
    var keyName = 's_ni',
        linkHref = linkNode.attr('href'),
        domain = linkHref.split('/')[2],
        isSameDomain = (domain == document.domain),
        isWithinSameDomain = guardian.r2.OmnitureTracking.isWithinSameDomain(linkHref, document.domain),
        isCrossingEditionDomains = (document.domain.indexOf('www.guardian.co.uk')!=-1 && domain.indexOf('www.guardiannews.com')!=-1) ||
                                    (document.domain.indexOf('www.guardiannews.com')!=-1 && domain.indexOf('www.guardian.co.uk')!=-1);
        success = false;

    // 1. If we're on the same domain, try with sessionStorage
    if (isSameDomain) {
        try {
            sessionStorage.setItem(keyName, linkName);
            success = true;
        } catch(e) {
            success = false;
        }
    }

    // 2. Otherwise fallback to cookies if we're on the same domain
    if (!success && isWithinSameDomain) {
        var splitDomain = document.domain.split('.'),
            localDomain =  '.' + splitDomain.slice(splitDomain.length-2).join('.');

        jQ.cookie(keyName, linkName, {domain:localDomain, path:'/'});

        // Check that the cookie has been set correctly
        success = (jQ.cookie(keyName) == linkName) ? true : false;
    }


    // 3. If we still fail, set as querystring
    // Note: Crossing edition domains (.co.uk/.com) is excluded so we don't end up with dirty URLs
    if (!success &&
        guardian.r2.OmnitureTracking.isGuDomain(domain) &&
        !isCrossingEditionDomains) {
            var separator = (linkHref.indexOf('?') == -1) ? '?' : '&';
            linkNode.attr('href', linkHref + separator + 'guni=' + linkName);
    }
};


guardian.r2.OmnitureTracking.trackSocialShare = function(shareName, componentName) {
    var s = s_gi(s_account);

    // GooglePlus doesn't tell us the container of the clicked button
    // so we have to do it here
    if (shareName == 'google plus') {
        componentName = guardian.r2.OmnitureTracking.contentType + ':' + componentName;
    }

    s.events = 'event16,event37';
    s.eVar12 = shareName;
    s.eVar37 = componentName;
    s.linkTrackVars = 'events,eVar12,eVar37,' + // Share props
                      'channel,prop9,prop19,prop47,prop23,prop73,prop74,prop75,' + // Page props
                      'prop3,prop4,prop6,prop7,prop10,prop48,prop64,prop65,prop66,eVar70'; // Content props

    s.linkTrackEvents = s.events;
    s.tl(true, 'o', 'Sharing in social network');
};


// This checks if the given domain is a guardian domain
guardian.r2.OmnitureTracking.isGuDomain = function(domain) {
    var guDomains = s.linkInternalFilters.split(',');
    for (var i=0; i<guDomains.length; i++) {
        if (domain.indexOf(guDomains[i]) != -1) {
            return true;
        }
    }
    return false;
};

// This checks if the given link is within the given domain
guardian.r2.OmnitureTracking.isWithinSameDomain = function(linkHref, domain) {
    var linkDomain = linkHref.match(/https?:\/\/.*?\.(.*(\.co\.uk|\.com)).*/)[1];
    domain = domain.replace('www.', '');

    return (domain == linkDomain) ? true : false;
};


// If there's YouTube videos on the page, load the Omniture Media module
jQ(function() {
    var hasYouTubeVideos = jQ('iframe[src*="//www.youtube.com"]').length;
    if (typeof(s_loadMediaModule) != 'undefined' && hasYouTubeVideos) {
        var l2content = s.prop11 || '';
        s_loadMediaModule(s);
        s_trackVideoContent(s, l2content, 'YouTube', false);
    }
});
/* 4e07daba1460b15a74c47a12f30b71a5a74cec77/common/scripts/mediamath-tag.js */
(function($) {
    // MediaMath Tag
    function getReferrerSearchTerms() {
        var href = document.referrer,
            hashes = href.slice(href.indexOf('?') + 1).split('&'),
            parameters = ['q','p','as_q','as_epq','as_oq','query','search','wd','ix'];

        for(var i=0; i<hashes.length; i++) {
            var hash = hashes[i].split('='),
                key = hash[0],
                term;

            if (parameters.indexOf(key) != -1) {
               term = unescape(hash[1]);
               term = term.replace(/\+/g, ' ');
               return term;
            }
        }

        return '';
    }

    var tagBaseUrl = '//pixel.mathtag.com/event/img?mt_id=328671&mt_adid=114751',
        keywords   = jQ('meta[name="keywords"]').attr('content'),
        tagObject  = {
            v1: sitePrefixUrl + guardian.page.contentId,
            v2: guardian.page.section,
            v3: getReferrerSearchTerms(),
            v4: document.referrer,
            v5: keywords ? keywords.replace(/,/g,'|') : '',
            v6: guardian.page.type
        };

    // Fire off beacon
    var tagUrl = tagBaseUrl + '&' + jQ.param(tagObject),
        tagImg = new Image();

    tagImg.src = tagUrl;
})(jQ);
/* 4e07daba1460b15a74c47a12f30b71a5a74cec77/common/scripts/signinTopNav.js */
jQ(document).ready(function () {
	var dropdowns = jQ('.drop-down');
	jQ('.drop-down').bind('click', function() {
		jQ(this).focus();
	});
	jQ(window).bind('click', function() {
		dropdowns.blur();
	});

	jQ('#drop-down-edition span a').click(function () {
		var currentEdition    = jQ('#drop-down-edition span.current-edition').text(),
			switchToEdition   = jQ(this).text(),
			editionSwitchDesc = "Edition Change: " + currentEdition + " to " + switchToEdition;

		guardian.r2.OmnitureTracking({
			"evars": [{"key": "37", "value": editionSwitchDesc }],
			"events": [{"id": "37"}],
			"description": editionSwitchDesc
		});
	});
});
/* 4e07daba1460b15a74c47a12f30b71a5a74cec77/common/scripts/ticker.js */
ensurePackage('guardian.r2');

guardian.r2.newsTicker = function () {
	var speed = 5500; //change every 5 secs; TAKE INTO ACCOUNT THE FADE TIME THOUGH!
	var count = 0;
	var trendCount = 0;
	var paused = false;
	var newsHeadlines = jQ('ul#ticker > li'); //get the headlines
	var trends = jQ('li.trending ul li');
	var trendTimer;
	var tickerStrap = jQ("#newsticker .ticker-heading strong");
	var instance = this;

	this.changeStory = function(direction, hover) {
		var currentItem = jQ(newsHeadlines).eq(count);
		var newItem;

		timer = window.clearTimeout(timer);
		switch (direction) {

			case 'back' :  //previous
				if(paused) {
					paused = false; //make sure we unpause when clicking next or previous
				}
				//decrement the count; go to the end if we've reached the first one
				(count === 0) ? count = newsHeadlines.length-1 : count--;
				//get the previous item
				newItem = newsHeadlines.eq(count);
				if(newItem.hasClass('trending')) {
					changeStrap('Current topics:');
					trends.show();
				} else {
					changeStrap('Breaking news:');
				}
				break;

			case 'pause' : //next
				if(!paused) {
					paused = true;
					if(currentItem.hasClass('trending')) {
						trendTimer = window.clearTimeout(trendTimer);
						trends.show();
					}
					break;
				} else {
					changeStrap('Breaking news:');
					paused = false;
				}


			default : 	//next - or the default
				if(paused) {
					paused = false;
				}
				//increment the count; set to 0 if we're at the end
				(count === newsHeadlines.length-1) ? count = 0 : count++;
				//get the next one
				newItem = newsHeadlines.eq(count);
				if(direction === "forward") {
					if(newItem.hasClass('trending')) {
						changeStrap('Current topics:');
						trends.show();
					} else {
						changeStrap('Breaking news:');
					}
				}

				break;
		}
		if(!paused) {
			if( newItem.hasClass('trending') && (!direction || direction =="pause") ) {
				currentItem.fadeOut(250, function() {
					trends.hide();
					changeStrap('Current topics:');
					newItem.fadeIn(250);
					trendingTicker();
				});

			} else {
				currentItem.fadeOut(250, function() {
					newsHeadlines.hide();
					newItem.fadeIn(250);
				});
				timer = window.setTimeout(function() {instance.changeStory();}, speed);
			}
		}
	};

	this.hoverPause = function(ev) {
		if(ev=="in") {
			if(trendTimer) {
				trendTimer = window.clearTimeout(trendTimer);
				trends.show();
			} else if(timer) {
				timer = window.clearTimeout(timer);
			}
		} else {
			timer = window.setTimeout(function() {instance.changeStory('pause');}, 2000);
		}
	};

	function trendingTicker() {
		trends.eq(trendCount).fadeIn(250);

		if(trendCount < trends.length) {
			trendCount++;
			trendTimer = window.setTimeout(trendingTicker, speed);
		} else {
			//go back to the main ticker
			trendCount = 0;
			instance.changeStory();
			trends.hide();
			changeStrap('Breaking news:');
		}
	}

	function changeStrap(newText) {
		if(tickerStrap.text() != newText) {
			tickerStrap.hide();
			tickerStrap.text(newText);
			tickerStrap.fadeIn(250);
		}
	}

	//set up event handlers
	jQ('p#ticker-controls input').click( function() {
		var direction = jQ(this).attr('alt');
		instance.changeStory(direction);
	});

	newsHeadlines.hover(function() {
		instance.hoverPause('in');
	})
	.hover(function() {
		instance.hoverPause('out');
	});

	//set the timer running
	var timer = window.setTimeout ( function() {instance.changeStory();}, speed);
};

jQ(document).ready(function() {
	var myTicker = new guardian.r2.newsTicker();
});

