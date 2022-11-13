// ==UserScript==
// @name         MouseHunt - Poweruser QoL scripts
// @namespace    https://greasyfork.org/en/users/900615-personalpalimpsest
// @version      0.8.0
// @description  dabbling into scripting to solve little pet peeves
// @author       asterios
// @match        http://www.mousehuntgame.com/*
// @match        https://www.mousehuntgame.com/*
// @grant        none
// ==/UserScript==

// Friend per region summary view
(() => {
	let regionList = [];
	let user_region = '';

	async function addButton() {
		// console.log('Attempt add button');
		let friendRegionBt = document.createElement("button");
		friendRegionBt.innerHTML = "Show #Friends/Region";
		friendRegionBt.style.marginLeft = "5px";
		friendRegionBt.style.padding = "0px 3px";
		friendRegionBt.style.fontSize = "inherit";
		friendRegionBt.onclick = (()=>{
			if (document.querySelector('#ol')) {
				document.querySelector('#ol').remove();
			} else {
				renderList(regionList);
			}
		});
		document.querySelector(".campPage-trap-friendContainer .label").insertBefore(friendRegionBt, document.querySelector(".campPage-trap-friendContainer-toggleFriendsButton"));
	}

	function renderList(regionList) {
		let ol = document.createElement('ol');
		ol.id = "ol";
		ol.style.display = "grid";
		ol.style.gridTemplateColumns = "1fr 1fr";
		ol.style.textAlign = "center";
		document.querySelector('.campPage-trap-friendContainer').insertBefore(ol, document.querySelector('.campPage-trap-friendList'));

		regionList.forEach((region)=>{
			let li1 = document.createElement('li');
			li1.innerHTML += region.name;
			if (region.frdCt <= 10) li1.style.color = "rgba(69,69,69,0.420)";
			if (region.name == user_region) li1.style.color = "rgb(255,0,0)";
			ol.appendChild(li1);

			let li2 = document.createElement('li');
			li2.innerHTML += region.frdCt;
			if (region.frdCt <= 10) li2.style.color = "rgba(69,69,69,0.420)";
			if (region.name == user_region) li2.style.color = "rgb(255,0,0)";
			ol.appendChild(li2);
		});
	}

	async function getRegionList(regions) {
		for (const region in regions) {
			let regObj = {};
			regObj.name = regions[region].name;
			regObj.frdCt = regions[region].num_friends;
			for (const loc in regions[region].environments) {
				regions[region].environments[loc].name == user.environment_name ? user_region = regObj.name : null;
			}
			regionList.push(regObj);
		}
		await regionList.sort((a, b) => b.frdCt - a.frdCt);
		addButton();
	}

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

	let xhr = new XMLHttpRequest();
	xhr.open(
		"POST", `https://www.mousehuntgame.com/managers/ajax/pages/page.php?page_class=Travel&uh=${user.unique_hash}`);
	xhr.onload = function () {
		let regions = JSON.parse(xhr.responseText).page.tabs[0].regions;
		getRegionList(regions);
	};
	xhr.send();

	const campButton = document.querySelector('.camp .mousehuntHud-menu-item.root');
	campButton.onclick = (()=>{
		setTimeout(()=>{
			addButton();
		},1000)
	});
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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Change Inbox button to default to General tab
(() => {
	let inbox = document.querySelector('#hgbar_messages');
	// inbox.removeAttribute('onclick');
	inbox.onclick = (async ()=>{
		messenger.UI.notification.showPopup();
		await sleep(420);
		let draws = document.querySelectorAll('.message.daily_draw.notification.ballot')
		draws.forEach((msg)=>{
			msg.remove();
		})
		document.querySelector('.tabs [data-tab="daily_draw"]').remove();
		messenger.UI.notification.showTab('general');
	})
})();
