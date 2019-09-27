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
        "courier":       require('Roles_courier')
    },general : [
    "harvester", "transport", "claimer", "upgrader", "builder", "mechanic", "linker", "courier"
    ]
}