class NPCEntity {
    constructor(id, name, location) {
        this.id = id;
        this.name = name;
        this.location = location; // { cityId, lat, lng }
        
        this.attributes = {
            intelligence: Math.random() * 100,
            creativity: Math.random() * 100,
            ambition: Math.random() * 100,
            empathy: Math.random() * 100,
            health: 100,
            age: 0
        };

        this.status = {
            wealth: 0,
            occupation: 'Unemployed',
            happiness: 50,
            isAlive: true
        };

        this.memory = []; // Permanent memory store
        this.relationships = new Map(); // { npcId => affinity }
        
        this.currentGoal = 'Find Purpose';
        this.routine = [];
    }

    tick(globalTime, cityData) {
        if (!this.status.isAlive) return;

        this.attributes.age += 1;

        // Process Goals
        if (this.currentGoal === 'Find Purpose') {
            if (this.attributes.intelligence > 80 && this.attributes.creativity > 80) {
                this.currentGoal = 'Invent Technology';
                this.status.occupation = 'Scientist';
            } else if (this.attributes.ambition > 80) {
                this.currentGoal = 'Acquire Wealth';
                this.status.occupation = 'Entrepreneur';
            } else {
                this.currentGoal = 'Survive';
                this.status.occupation = 'Worker';
            }
        }

        // Simulate daily life based on goals
        if (this.currentGoal === 'Invent Technology') {
            if (Math.random() < 0.01) {
                this.learnEvent(globalTime, 'Discovered a new scientific principle');
                cityData.techLevel += 0.01; // Contributes to city
            }
        } else if (this.currentGoal === 'Acquire Wealth') {
            this.status.wealth += this.attributes.ambition * 10;
        }

        // Random Life Events
        if (Math.random() < 0.05) {
            this.healthEvent();
        }

        // AI adapting to anomalous events
        if (cityData.event === 'Zero Gravity Storm') {
            if (this.attributes.intelligence > 50) {
                this.learnEvent(globalTime, 'Survived zero-G storm using tethering');
                this.status.happiness -= 5;
            } else {
                this.attributes.health -= 20;
                this.learnEvent(globalTime, 'Injured during zero-G storm');
            }
        }
    }

    learnEvent(time, description) {
        this.memory.push({ time, description });
        // Deep learning simulation: adjusts attributes based on memory
        if (description.includes('Injured')) {
            this.status.happiness -= 10;
        } else if (description.includes('Discovered')) {
            this.status.happiness += 20;
            this.attributes.intelligence += 1;
        }
    }

    healthEvent() {
        if (Math.random() < 0.1) { // 10% chance to get sick when event triggers
            this.attributes.health -= 10;
            if (this.attributes.health <= 0) {
                this.status.isAlive = false;
                this.learnEvent(Date.now(), 'Died');
            }
        }
    }
}

module.exports = NPCEntity;
