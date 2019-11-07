var expansionDiv,
	closeButton,
	expandButton,
	clickthroughButton,
	staticImage,
	adId,
	fadeAnimation;
var adKitReady = false;

function initializeCreative() {
	if (adKitReady === false) {
		adKitReady = true;
		expansionDiv = document.getElementById("expansion");
		closeButton = document.getElementById("closeButton");
		expandButton = document.getElementById("expandButton");
		clickthroughButton = document.getElementById("clickthroughButton");
		staticImage = document.getElementById("staticImage");

		closeButton.addEventListener("click", handleCloseButtonClick);
		expandButton.addEventListener("click", handleExpandButtonClick);
		clickthroughButton.addEventListener(
			"click",
			handleClickthroughButtonClick
		);

		try {
			adId = EB._adConfig.adId;
		} catch (error) {
			adId = "LocalTest";
		}

		var itemName = adId + "_setDate";
		if (localStorage.getItem(itemName) === null) {
			localStorage.setItem(itemName, new Date());
		}

		startAd();
	}
}

function startAd() {
	try {
		EB._sendMessage("setInfo", { topGap: setup.topGap });
	} catch (err) {}
	initStaticBG();
	fadeIn(expansionDiv);
}

function initStaticBG() {
	staticImage.style.display = "block";
	if (setup.autoExpand) {
		if (
			setup.autoExpandFrequency > 0 &&
			checkAutoExpandFrequency() === true
		) {
			setTimeout(function() {
				handleExpandButtonClick();
			}, 2500);
		}
	}
}

function checkAutoExpandFrequency() {
	var itemName = adId + "_autoExpansions";
	var remainingExpansions = localStorage.getItem(itemName);
	if (remainingExpansions > 0 || remainingExpansions === null) {
		remainingExpansions =
			remainingExpansions === null
				? setup.autoExpandFrequency - 1
				: remainingExpansions - 1;
		localStorage.setItem(itemName, remainingExpansions);
		return true;
	} else {
		if (checkCookieDate() === true) {
			remainingExpansions = setup.autoExpandFrequency - 1;
			localStorage.setItem(itemName, remainingExpansions);
			return true;
		}
		return false;
	}
}

function checkCookieDate() {
	var itemName = adId + "_setDate";
	var cookieDate = new Date(localStorage.getItem(itemName));
	var actualDate = new Date();
	var diff = (actualDate - cookieDate) / (1000 * 60 * 60 * 24);
	if (diff >= 1) {
		localStorage.setItem(itemName, actualDate);
		return true;
	} else {
		return false;
	}
}
function handleCloseButtonClick() {
	EB.userActionCounter("Collapsed");
	fadeOut(closeButton);
	fadeIn(expandButton);

	try {
		EB._sendMessage("collapseRequest", {});
	} catch (err) {}

	expandButton.removeEventListener("click", handleExpandButtonClick);
	setTimeout(function() {
		expandButton.addEventListener("click", handleExpandButtonClick);
	}, 1000);
}
function handleExpandButtonClick() {
	EB.userActionCounter("Expanded");
	fadeIn(closeButton);
	fadeOut(expandButton);

	try {
		EB._sendMessage("expansionRequest", {});
	} catch (err) {}

	closeButton.removeEventListener("click", handleCloseButtonClick);
	setTimeout(function() {
		closeButton.addEventListener("click", handleCloseButtonClick);
	}, 1000);
}

function handleClickthroughButtonClick() {
	EB.clickthrough();
}

function fadeIn(elem) {
	elem.style.display = "block";
	elem.classList.add("fade-in");
	setTimeout(function() {
		elem.classList.remove("fade-in");
	}, 1000);
}
function fadeOut(elem) {
	elem.classList.add("fade-out");
	setTimeout(function() {
		elem.style.display = "none";
		elem.classList.remove("fade-out");
	}, 1000);
}

function adaptTopPosition(pixels) {
	expandButton.style.top = expandButton.offsetTop + pixels + "px";
}

window.addEventListener(
	"message",
	function(event) {
		try {
			var obj = JSON.parse(event.data);
			switch (obj.type) {
				case "sendCreativeId":
					if (obj.data.marginTop != "" && obj.data.marginTop != "0") {
						adaptTopPosition(obj.data.marginTop);
					}
					break;
				case "baseExpansion":
					handleExpandButtonClick();
					break;
			}
		} catch (err) {
			console.log("Error Panel: ", err);
		}
	},
	false
);
