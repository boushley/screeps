'use strict';
(function() {

class GoalBreakdown {
    constructor(goal) {
        this.goal = goal;
        this.data = {};
    }

    getRole(role) {
        if (!this.data[role]) {
            this.data[role] = [];
            this.data[role].id = Math.random().toString(32).substr(2);
        }
        return this.data[role];
    }
}

class CreepBreakdown {
    constructor() {
        this.data = {};
    }

    getGoal(goal) {
        if (!this.data[goal]) {
            this.data[goal] = new GoalBreakdown(goal);
        }
        return this.data[goal];
    }
}

module.exports = exports = new CreepBreakdown();

for(let i in Game.creeps) {
    let creep = Game.creeps[i];
    if (!creep.my) {
        continue;
    }

    let role = creep.memory.role,
        goal = creep.memory.goal,
        goalBreakdown = exports.getGoal(goal),
        roleBreakdown = goalBreakdown.getRole(role);

    roleBreakdown.push(creep);
}
})();
