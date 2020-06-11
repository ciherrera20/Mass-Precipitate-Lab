// Creates an object from a prototype and constructor
let createObject = function(prototype, constructor) {
	let that = Object.create(prototype);

	that.super = prototype;
	prototype.constructor = constructor;

	return that;
}

// Balance scope
{
	let BalanceTemplate = Object.create(null);
	
	BalanceTemplate.getMass = function() {
		return this.restMass + this.items.reduce(function(acc, item) {
			return acc += item.getMass();
		}, 0);
	}
	
	BalanceTemplate.zero = function() {
		this.restMass = -(this.getMass() - this.restMass);
	}
	
	BalanceTemplate.addItem = function(item) {
		this.items.push(item);
	}
	
	BalanceTemplate.removeItem = function(item) {
		var index = this.items.indexOf(item);
		if (index != -1) {
			return this.removeIndex(index);
		}
		return null;
	}
	
	BalanceTemplate.removeIndex = function(index) {
			if (index < 0 || index >= this.items.length) {
				return null;	
			}
			return this.items[index];
	}
	
	var Balance = function(restMass) {
		if (this.constructor === Balance) {
			return Balance(...arguments);
		}
		let that = createObject(BalanceTemplate, Balance);
		
		that.restMass = restMass;
		that.items = [];
		
		return that;
	}
}

// Vial scope
{
	let VialTemplate = Object.create(null);
		
	var Vial = function() {
		if (this.constructor === Vial) {
			return Vial(...arguments);
		}
		let that = createObject(VialTemplate, Vial);
		
		return that;
	}
}