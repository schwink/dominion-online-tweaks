// ==UserScript==
// @name       Dominion Online permanent card descriptions
// @namespace  net.schwink.dominion
// @version    0.1
// @description  Adds a new layout column during game play that shows descriptions of all the action cards in the game.
// @match      http://dominion.isotropic.org/play
// @copyright  2012+, You
// ==/UserScript==

// The channel triggers a fetch from a URL like /semistatic/cardinfo.2ade3a46.json
// The response is a JSON object containing the descriptions of all card types
// It is set to some global property on window
// Loop over window and get the biggest one, and put it somewhere consistent
(function() {

    setInterval(function() {
        if (window.net_schwink_dominion_cards) {
            return;
        }

        var skip = {
            _webRequest: true,
            applicationCache: true,
            location: true,
            performance: true,
            Registry: true
        };

        var longestKey = '';
        var longestLength = 0;
        for (var k in unsafeWindow) {
            if (skip[k]) {
                continue;
            }

            try {
                var l = JSON.stringify(unsafeWindow[k]).length;
                if (l > longestLength) {
                    longestLength = l;
                    longestKey = k;
                }
            } catch (e) {
                continue;
            }
        }

        console.log("Found longest key '" + longestKey + "', which is hopefully the card descriptions.");
        window.net_schwink_dominion_cards = unsafeWindow[longestKey];
        console.log(window.net_schwink_dominion_cards);
    }, 2000);

    function renderCard(data) {
        // data looks like
        // { color: "<span class=card-none>Adventurer</span>",
        //   image: "adventurer.24cc2833",
        //   num: 28,
        //   text: "<span class=ititle><span class=card-none>Adventurer</span></span><span class=icost> ..."
        // }

        var container = document.createElement('div');
        container.innerHTML = data.text;
        container.style.border = '1px solid black';
        container.style.marginRight = '5px';
        return container;
    }

    function render() {

        var cardData = window.net_schwink_dominion_cards;
        if (!cardData) {
            return;
        }

        var rightDiv = document.getElementById('right');
        var cardDiv = document.getElementsByClassName('net_schwink_dominion_cards_column')[0];

        // if #right has className 'right', then there is a game going on, otherwise lobby
        if (rightDiv.className.match(/right/)) {
            // Game
            if (cardDiv) {
                if (cardDiv.childNodes.length) {
                    // Already rendered
                    return;
                }
                // else div exists but needs render
            } else {
                // Make room for the new column
                rightDiv.style.marginLeft = (350 + 200) + 'px';
            }
        } else {
            // Lobby
            if (cardDiv) {
                cardDiv.parentNode.removeChild(cardDiv);
            }
            rightDiv.style.marginLeft = '';
            return;
        }

        // Insert another column
        if (!cardDiv) {
            cardDiv = document.createElement('div');
            cardDiv.className = 'net_schwink_dominion_cards_column';
            cardDiv.style.position = 'fixed';
            cardDiv.style.left = '350px';
            cardDiv.style.width = '210px';
            cardDiv.style.bottom = '0px';
            cardDiv.style.height = '100%';
            cardDiv.style.margin = '0px';
            cardDiv.style.overflowX = 'hidden';
            cardDiv.style.overflowY = 'scroll';

            rightDiv.parentNode.insertBefore(cardDiv, rightDiv);
        }

        while (cardDiv.hasChildNodes()) {
            cardDiv.removeChild(node.lastChild);
        }

        var skip = {
            Colony: true,
            Province: true,
            Duchy: true,
            Estate: true,
            Platinum: true,
            Gold: true,
            Potion: true,
            Silver: true,
            Copper: true,
            Curse: true
        };

        var supplyCardDivs = document.getElementsByClassName('supplycard');
        for (var i = 0, l = supplyCardDivs.length; i < l; i++) {
            var supplyCardDiv = supplyCardDivs[i];
            var cardName = supplyCardDiv.getAttribute('cardname');

            if (skip[cardName]) {
                continue;
            }

            cardDiv.appendChild(renderCard(cardData[cardName]));
        }
    }

    // It's pretty hard to detect when the page changes, because it's all re-rendered often
    // So, just check every second and try to avoid doing extra work in render()
    setInterval(render, 1000);

})();