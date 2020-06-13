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

// SCVariable scope
{
	let SCVariableTemplate = {};

	SCVariableTemplate.getKey = function() {
		return this.key;
	}

	SCVariableTemplate.getVar = function() {
		return State.variables[this.key];
	}

	SCVariableTemplate.clone = function() {
		return cloneKeys(this, Object.create(Object.getPrototypeOf(this)));
	}

	SCVariableTemplate.toObj = function() {
		return cloneKeys(this, {});
	}

	// Needs to be overridden
	SCVariableTemplate.toJSON = function() {
		return JSON.reviveWrapper("setup.SCVariable.fromObj($ReviveData$)", this.toObj());
	}

	var SCVariable = function(key) {
		if (this && this.constructor === SCVariable) {
			return SCVariable(...arguments);
		}
		let that = Object.create(SCVariableTemplate);

		that.key = key;
		State.variables[key] = that;

		return that;
	}
	setup.SCVariable = SCVariable;

	SCVariable.template = SCVariableTemplate;

	// Needs to be overridden
	SCVariable.fromObj = function(obj) {
		return assignKeys(obj, Object.create(SCVariableTemplate));
	}

	SCVariable.addVar = function(obj) {
		State.variables[obj.key] = obj;
	}

	SCVariable.getVar = function(key) {
		return State.variables[key];
	}

	SCVariable.toJSONFactory = function(constructorName) {
		if (!setup[constructorName]) {
			throw new Error("Constructor must be a property on the setup object");
		}

		return function() {
			return JSON.reviveWrapper('setup.' + constructorName + '.fromObj($ReviveData$)', this.toObj());
		}
	}

	SCVariable.fromObjFactory = function(prototype) {
		return function(obj) {
			return assignKeys(obj, Object.create(prototype));
		}
	}
}

// Balance scope
{
	let BalanceTemplate = Object.create(SCVariable.template);

	BalanceTemplate.getMass = function() {
		return this.restMass + this.items.reduce(function(acc, item) {
			return acc += SCVariable.getVar(item).getMass();
		}, 0);
	}

	BalanceTemplate.zero = function() {
		this.restMass = -(this.getMass() - this.restMass);
	}

	BalanceTemplate.addItem = function(item) {
		this.items.push(item.getKey());
	}

	BalanceTemplate.getItemIndex = function(item) {
		return this.items.indexOf(item.getKey());
	}

	BalanceTemplate.removeItem = function(item) {
		var index = this.getItemIndex(item);
		if (index != -1) {
			return this.removeIndex(index);
		}
		return null;		
	}

	BalanceTemplate.removeIndex = function(index) {
		if (index < 0 || index >= this.items.length) {
			return null;	
		}
		this.items.splice(index, 1);
		return this.items[index];
	}

	BalanceTemplate.getItemDisplayName = function(index) {
		return SCVariable.getVar(this.items[index]).displayName;
	}

	BalanceTemplate.toJSON = function() {
		return JSON.reviveWrapper('setup.Balance.fromObj($ReviveData$)', this.toObj());
	}

	var Balance = function(key, restMass) {
		if (this && this.constructor === Balance) {
			return Balance(...arguments);
		}
		let that = Object.create(BalanceTemplate);
		
		that.key = key;
		that.restMass = restMass;
		that.items = [];

		return that;
	}
	setup.Balance = Balance;

	Balance.template = BalanceTemplate;

	Balance.fromObj = function(obj) {
		return assignKeys(obj, Object.create(BalanceTemplate));
	}
}

// Bottle scope
{
	let BottleTemplate = Object.create(SCVariable.template);

	BottleTemplate.pourIntoVial = function(vial) {
		if (this.key === "calciumNitrateBottle") {
			if (vial.containsCalciumNitrate) {
				return false;
			} else {
				vial.containsCalciumNitrate = true;
				this.volume -= 25;
				return true;
			}
		} else if (this.key === "sodiumCarbonateBottle") {
			if (vial.containsSodiumCarbonate) {
				return false;
			} else {
				vial.containsSodiumCarbonate = true;
				this.volume -= 25;
				return true;
			}
		}
	}

	BottleTemplate.toJSON = function() {
		return JSON.reviveWrapper('setup.Bottle.fromObj($ReviveData$)', this.toObj());
	}

	let Bottle = function(key, displayName, volume) {
		if (this && this.constructor === Bottle) {
			return Bottle(...arguments);
		}
		let that = Object.create(BottleTemplate);

		that.key = key;
		that.displayName = displayName;
		that.volume = volume;

		return that;
	}
	setup.Bottle = Bottle;

	Bottle.template = BottleTemplate;

	Bottle.fromObj = function(obj) {
		return assignKeys(obj, Object.create(BottleTemplate));
	}

	var calciumNitrateBottle = Bottle("calciumNitrateBottle", "Calcium Nitrate Bottle", 300);
	var sodiumCarbonateBottle = Bottle("sodiumCarbonateBottle", "Sodium Carbonate Bottle", 300);
}

// Vial scope
{
	let VialTemplate = Object.create(SCVariable.template);

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

	VialTemplate.toJSON = function() {
		return JSON.reviveWrapper('setup.Vial.fromObj($ReviveData$)', this.toObj());
	}

	var Vial = function(key, displayName) {
		if (this && this.constructor === Vial) {
			return Vial(...arguments);
		}
		let that = Object.create(VialTemplate);

		that.key = key;
		that.displayName = displayName;
		that.containsCalciumNitrate = false;
		that.containsSodiumCarbonate = false;

		return that;
	}
	setup.Vial = Vial;

	Vial.template = VialTemplate;

	Vial.fromObj = function(obj) {
		return assignKeys(obj, Object.create(VialTemplate));
	}
}

// API scope
{
	let APITemplate = Object.create(SCVariable.template);

	APITemplate.get = function() {
		return window.SugarCube;
	}

	APITemplate.log = function() {
		console.log(...arguments);
	}

	APITemplate.eval = function(code) {
		return eval(code);
	}
	
	let API = function(key) {
		if (this && this.constructor === API) {
			return API(...arguments);
		}
		let that = Object.create(APITemplate);

		that.key = key;

		return that;
	}
	setup.API = API;

	API.template = APITemplate;

	API.fromObj = SCVariable.fromObjFactory(APITemplate);
	APITemplate.toJSON = SCVariable.toJSONFactory("API");

	SCVariable.addVar(API("API"));
}

SCVariable.addVar(Balance("balance", Math.floor((Math.random() * 11) - 5)));
SCVariable.addVar(calciumNitrateBottle);
SCVariable.addVar(sodiumCarbonateBottle);
SCVariable.addVar(Vial("vial1", "Vial 1"));
SCVariable.addVar(Vial("vial2", "Vial 2"));