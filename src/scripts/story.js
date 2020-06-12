// Creates an object from a prototype and constructor
// This probably doesn't work with Twine
/*let createObject = function(prototype, constructor) {
	let that = Object.create(prototype);

	that.super = prototype;
	prototype.constructor = constructor;

	return that;
}*/

// Deep copies keys from the object from to the object to
function cloneKeys(from, to) {
	Object.keys(from).forEach(function(key) {
		to[key] = clone(from[key]);
	});
	return to;
}

// Shallow copies keys from the object from to the object to
function assignKeys(from, to) {
	Object.keys(from).forEach(function(key) {
		to[key] = from[key];
	});
	return to;
}

// Balance scope
{
	let BalanceTemplate = {};
	
	// Get the mass currently measured by the balance
	BalanceTemplate.getMass = function() {
		return this.restMass + this.itemKeys.reduce(function(acc, itemKey) {
			return acc += State.variables[itemKey].getMass();
		}, 0);
	}
	
	// Set the current mass to the balance's new zero
	BalanceTemplate.zero = function() {
		this.restMass = -(this.getMass() - this.restMass);
	}
	
	// Add an item onto the balance
	BalanceTemplate.addItemKey = function(itemKey) {
		this.itemKeys.push(itemKey);
	}
	
	BalanceTemplate.getItemKeyIndex = function(itemKey) {
		return this.itemKeys.indexOf(itemKey);
	}

	// Remove an item from the balance
	BalanceTemplate.removeItemKey = function(itemKey) {
		var index = this.itemKeys.indexOf(itemKey);
		if (index != -1) {
			return this.removeIndex(index);
		}
		return null;
	}
	
	// Remove an item given its index from the balance
	BalanceTemplate.removeIndex = function(index) {
		console.log("Removing", index);
		if (index < 0 || index >= this.itemKeys.length) {
			return null;	
		}
		this.itemKeys.splice(index, 1);
		return this.itemKeys[index];
	}

	BalanceTemplate.getItemDisplayName = function(index) {
		return State.variables[this.itemKeys[index]].displayName;
	}

	BalanceTemplate.clone = function() {
		return cloneKeys(this, Object.create(BalanceTemplate));
	}

	BalanceTemplate.toJSON = function() {
		return JSON.reviveWrapper('Balance.fromObj($ReviveData$)', cloneKeys(this, {}));
	}
	
	var Balance = function(restMass) {
		if (this && this.constructor === Balance) {
			return Balance(...arguments);
		}
		let that = Object.create(BalanceTemplate);
		
		that.restMass = restMass;
		that.itemKeys = [];
		
		return that;
	}

	Balance.fromObj = function(obj) {
		return assignKeys(obj, Object.create(BalanceTemplate));
	}
}

// Bottle scope
{
	let BottleTemplate = {};

	BottleTemplate.pourIntoVial = function(vial) {
		if (this.getContent() === "calciumNitrate") {
			if (vial.containsCalciumNitrate) {
				return false;
			} else {
				vial.containsCalciumNitrate = true;
				return true;
			}
		} else if (this.getContent() === "sodiumCarbonate") {
			if (vial.containsSodiumCarbonate) {
				return false;
			} else {
				vial.containsSodiumCarbonate = true;
				return true;
			}
		}
	}

	BottleTemplate.clone = function() {
		return Bottle(this.displayName, this.getContent());
	}

	BottleTemplate.toJSON = function() {
		return JSON.reviveWrapper('Bottle({0}, {1})', this.displayName, this.getContent());
	}

	let Bottle = function(displayName, content) {
		if (this && this.constructor === Bottle) {
			return Bottle(...arguments);
		}
		let that = Object.create(BottleTemplate);

		that.getContent = function() {
			return content;
		}

		return that;
	}

	var calciumNitrateBottle = Bottle("Calcium Nitrate Bottle", "calciumNitrate");
	var sodiumCarbonateBottle = Bottle("Sodium Carbonate Bottle", "sodiumCarbonate");
}

// Vial scope
{
	let VialTemplate = {};

	VialTemplate.pourIntoVial = function(vial) {
		if (this.containsSodiumCarbonate && vial.containsSodiumCarbonate) {
			return false;
		}
		if (this.containsCalciumNitrate && vial.containsCalciumNitrate) {
			return false;
		}

		vial.containsCalciumNitrate = vial.containsCalciumNitrate || this.containsCalciumNitrate;
		vial.containsSodiumCarbonate = vial.containsSodiumCarbonate || this.containsSodiumCarbonate;
		this.containsCalciumNitrate = false;
		this.containsSodiumCarbonate = false;

		return true;
	}

	VialTemplate.getMass = function() {
		let mass = 5;
		if (this.containsCalciumNitrate) {
			mass += 24.41;
		}
		if (this.containsSodiumCarbonate) {
			mass += 25.265;
		}
		return mass;
	}

	VialTemplate.containsPrecipitate = function() {
		return this.containsCalciumNitrate && this.containsSodiumCarbonate;
	}

	VialTemplate.clone = function() {
		return cloneKeys(this, Object.create(VialTemplate));
	}

	VialTemplate.toJSON = function() {
		return JSON.reviveWrapper('Vial.fromObj($ReviveData$)', cloneKeys(this, {}));
	}

	var Vial = function(displayName) {
		if (this && this.constructor === Vial) {
			return Vial(...arguments);
		}
		let that = Object.create(VialTemplate);

		that.displayName = displayName;
		that.containsCalciumNitrate = false;
		that.containsSodiumCarbonate = false;

		return that;
	}

	Vial.fromObj = function(obj) {
		return assignKeys(obj, Object.create(VialTemplate));
	}
}

State.variables.balance = Balance(Math.floor((Math.random() * 11) - 5));
State.variables.calciumNitrateBottle = calciumNitrateBottle;
State.variables.sodiumCarbonateBottle = sodiumCarbonateBottle;
State.variables.vial1 = Vial("Vial 1");
State.variables.vial2 = Vial("Vial 2");