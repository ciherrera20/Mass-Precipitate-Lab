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

// TestObj scope
/*{
	let TestObjTemplate = {};
	let numTestObjs = 0;
	window.testObjs = [];

	TestObjTemplate.clone = function() {
		return TestObj(this.prop1, this.prop2);
	}

	TestObjTemplate.toObj = function() {
		console.log("Cloned", this.getUid());
		return {prop1: clone(this.prop1), prop2: clone(this.prop2)};
	}

	TestObjTemplate.toJSON = function() {
		console.log("JSONed", this.getUid());
		return JSON.reviveWrapper('setup.TestObj.fromObj($ReviveData$)', this.toObj());
	}

	var TestObj = function(prop1, prop2) {
		if (this && this.constructor === TestObj) {
			return TestObj(...arguments);
		}
		let that = Object.create(TestObjTemplate);
		let uid = numTestObjs++;

		that.prop1 = prop1 || '';
		that.prop2 = prop2 || '';
		that.getUid = function() {
			return uid;
		}

		window.testObjs.push(that);
		return that;
	}
	setup.TestObj = TestObj;

	TestObj.fromObj = function(obj) {
		return TestObj(obj.prop1, obj.prop2);
	}
}*/

//State.variables.testObj = TestObj("test value 1", "test value 2");

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
		return JSON.reviveWrapper('setup.Balance.fromObj($ReviveData$)', cloneKeys(this, {}));
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
	setup.Balance = Balance;

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
				this.volume -= 25;
				return true;
			}
		} else if (this.getContent() === "sodiumCarbonate") {
			if (vial.containsSodiumCarbonate) {
				return false;
			} else {
				vial.containsSodiumCarbonate = true;
				this.volume -= 25;
				return true;
			}
		}
	}

	BottleTemplate.clone = function() {
		return Bottle(this.displayName, this.getContent(), this.volume);
	}

	BottleTemplate.toObj = function() {
		return {displayName: this.displayName, content: this.getContent(), volume: this.volume};
	}

	BottleTemplate.toJSON = function() {
		return JSON.reviveWrapper('setup.Bottle.fromObj($ReviveData$)', this.toObj());
	}

	let Bottle = function(displayName, content, volume) {
		if (this && this.constructor === Bottle) {
			return Bottle(...arguments);
		}
		let that = Object.create(BottleTemplate);

		that.displayName = displayName;
		that.getContent = function() {
			return content;
		}
		that.volume = volume;

		return that;
	}
	setup.Bottle = Bottle;

	Bottle.fromObj = function(obj) {
		return Bottle(obj.displayName, obj.content, obj.volume);
	}

	var calciumNitrateBottle = Bottle("Calcium Nitrate Bottle", "calciumNitrate", 300);
	var sodiumCarbonateBottle = Bottle("Sodium Carbonate Bottle", "sodiumCarbonate", 300);
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
		return JSON.reviveWrapper('setup.Vial.fromObj($ReviveData$)', cloneKeys(this, {}));
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
	setup.Vial = Vial;

	Vial.fromObj = function(obj) {
		return assignKeys(obj, Object.create(VialTemplate));
	}
}

State.variables.balance = Balance(Math.floor((Math.random() * 11) - 5));
State.variables.calciumNitrateBottle = calciumNitrateBottle;
State.variables.sodiumCarbonateBottle = sodiumCarbonateBottle;
State.variables.vial1 = Vial("Vial 1");
State.variables.vial2 = Vial("Vial 2");