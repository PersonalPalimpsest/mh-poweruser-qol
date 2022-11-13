// ==UserScript==
// @name         MouseHunt - Poweruser QoL scripts
// @namespace    https://greasyfork.org/en/users/900615-personalpalimpsest
// @version      0.6
// @description  dabbling into scripting to solve little pet peeves
// @author       asterios
// @match        http://www.mousehuntgame.com/*
// @match        https://www.mousehuntgame.com/*
// @grant        none
// ==/UserScript==

// Friend per region summary view
(() => {
    var xhr = new XMLHttpRequest();
    xhr.open(
        "POST", `https://www.mousehuntgame.com/managers/ajax/pages/page.php?page_class=Travel&uh=${user.unique_hash}`);
    xhr.onload = function () {
        var friends = JSON.parse(xhr.responseText).page.tabs[0].regions;
        var masterArr = [];
        var user_region = '';
        //console.log(user.environment_name);
        for (var reg in friends) {
            var regObj = {};
            regObj.type = friends[reg].type;
            regObj.name = friends[reg].name;
            regObj.frdCt = friends[reg].num_friends;
            for (var loc in friends[reg].environments) {
                    if (friends[reg].environments[loc].name == user.environment_name) {
                        //console.log(friends[reg].environments[loc].name);
                        //console.log(user.environment_name);
                        //console.log(regObj.name);
                        user_region = regObj.name;
                    }
                }
             
            masterArr.push(regObj);
            //console.log(regObj);
        }
        //console.log(user_region);
        masterArr.sort((a, b) => b.frdCt - a.frdCt);   
        
        function makeList() {
            var ol = document.createElement('ol');
            ol.id = "ol";
            ol.style.display = "grid";
            ol.style.gridTemplateColumns = "1fr 1fr";
            ol.style.textAlign = "center";
            //console.log('Hello');
            //console.log(masterArr);
            document.querySelector('.campPage-trap-friendContainer').insertBefore(ol, document.querySelector('.campPage-trap-friendList'));

            masterArr.forEach(function (reg) {
                let li1 = document.createElement('li');
                li1.innerHTML += reg.name;
                if (reg.frdCt <= 10) li1.style.color = "rgba(69,69,69,0.420)";
                if (reg.name == user_region) li1.style.color = "rgb(255,0,0)";
                ol.appendChild(li1);

                let li2 = document.createElement('li');
                li2.innerHTML += reg.frdCt;
                if (reg.frdCt <= 10) li2.style.color = "rgba(69,69,69,0.420)";
                if (reg.name == user_region) li2.style.color = "rgb(255,0,0)";
                ol.appendChild(li2);
            });
        }
        var frdSum = document.createElement("button");
        frdSum.innerHTML = "Show #Friends/Region";
        frdSum.style.marginLeft = "5px";
        frdSum.style.padding = "0px 3px";
        frdSum.style.fontSize = "inherit";
        frdSum.addEventListener("click", function () {
            if (document.querySelector('#ol')) {
                document.querySelector('#ol').remove();
            } else {
                makeList();
            }
        });
        document.querySelector(".campPage-trap-friendContainer .label").insertBefore(frdSum, document.querySelector(".campPage-trap-friendContainer-toggleFriendsButton"))
        //temporary fix to move button to sidebar document.querySelector(".pageSidebarView").appendChild(frdSum)
    };
    xhr.send();
})();

// Hunter ID quick-nav
(function hunterIdNav() {

    function postReq(url, form) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    resolve(this);
                }
            };
            xhr.onerror = function () {
                reject(this);
            };
            xhr.send(form);
        });
    };

    function transferSB(snuid) {
        const newWindow = window.open(
            `https://www.mousehuntgame.com/supplytransfer.php?fid=${snuid}`
      );
        newWindow.addEventListener("load", function () {
            if (newWindow.supplyTransfer1) {
                newWindow.supplyTransfer1.setSelectedItemType("super_brie_cheese");
                newWindow.supplyTransfer1.renderTabMenu();
                newWindow.supplyTransfer1.render();
            }
        });
        return false;
    };

    const hidDiv = document.createElement("div");
    hidDiv.id = "tsitu-hunter-id-nav-ui";
    hidDiv.style.display = "grid";
    hidDiv.style.gridTemplateColumns = "40% 35% 25%";

    const hidInput = document.createElement("input");
    hidInput.type = "search";
    hidInput.id = "tsitu-input-hid";
    hidInput.style.fontSize = "inherit";
    hidInput.placeholder = "Hunter ID";
    hidInput.setAttribute("accesskey", "q");
    hidInput.addEventListener("keydown", function(event) {
        if(event.code == 'Enter') sendSBButton.click()
        else if(event.code == 'NumpadEnter') sendSBButton.click();
    }, true)

    const sendSBButton = document.createElement("button");
    sendSBButton.style.padding = "3px";
    sendSBButton.style.marginLeft = "-3px";
    sendSBButton.style.fontSize = "inherit";
    sendSBButton.innerText = "Send SB+";
    sendSBButton.onclick = function () {
        const hunterId = hidInput.value;
        if (
            hunterId.length > 0 &&
            hunterId.length === parseInt(hunterId).toString().length
        ) {
            postReq(
                "https://www.mousehuntgame.com/managers/ajax/pages/friends.php",
                `sn=Hitgrab&hg_is_ajax=1&action=community_search_by_id&user_id=${hunterId}&uh=${user.unique_hash}`
            ).then(res => {
                let response = null;
                try {
                    if (res) {
                        response = JSON.parse(res.responseText);
                        const snuid = response.friend.sn_user_id; // the juicy bits
                        transferSB(snuid);
                    }
                } catch (error) {
                    alert("Error while requesting hunter information");
                    console.error(error.stack);
                }
            });
        }
    };

    const profileButton = document.createElement("button");
    profileButton.style.padding = "3px";
    profileButton.style.marginLeft = "-3px";
    profileButton.style.fontSize = "inherit";
    profileButton.innerText = "Profile";
    profileButton.onclick = function () {
        const val = hidInput.value;
        if (
            val.length > 0 &&
            val.length === parseInt(val).toString().length
        ) {
            const newWindow = window.open(
                `https://www.mousehuntgame.com/profile.php?id=${val}`
              );
        }
    };

    hidDiv.appendChild(hidInput);
    hidDiv.appendChild(sendSBButton);
    hidDiv.appendChild(profileButton);

    document.querySelector(".pageSidebarView").appendChild(hidDiv);
})();
