module.exports = {
    roles: {
        "miner":         require('Roles_miner'),
        "transport":     require('Roles_transport'),
        "upgrader":      require('Roles_upgrader'),
        "builder":       require('Roles_builder'),
        "harvester":     require('Roles_harvester'),
        "claimer":       require('Roles_claimer'),
        "mechanic":      require('Roles_mechanic'),
        "runner":        require('Roles_runner'),
        "defender":      require('Roles_defender'),
        "healer":        require('Roles_healer'),
        "linker":        require('Roles_linker'),
        "remotecourier": require('Roles_remotecourier'),
        "remoteminer":   require('Roles_remoteminer'),
        "courier":       require('Roles_courier'),
        "filler":        require('Roles_filler'),
        "attacker":      require('Roles_attacker'),
        "starter":       require('Roles_starter')
    },general : [
        "harvester", "transport", "linker", "filler", "courier", "claimer", "starter","upgrader", "builder", "mechanic"
    ]
}