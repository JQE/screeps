module.exports = {
    roles: {
        "miner":            require('Roles_miner'),
        "transport":        require('Roles_transport'),
        "upgrader":         require('Roles_upgrader'),
        "builder":          require('Roles_builder'),
        "harvester":        require('Roles_harvester'),
        "claimer":          require('Roles_claimer'),
        "mechanic":         require('Roles_mechanic'),
        "runner":           require('Roles_runner'),
        "defender":         require('Roles_defender'),
        "healer":           require('Roles_healer'),
        "linker":           require('Roles_linker'),
        "courier":          require('Roles_courier'),
        "filler":           require('Roles_filler'),
        "attacker":         require('Roles_attacker'),
        "starter":          require('Roles_starter'),
        "remotedefender":   require('Roles_remote_defender'),
        "remotebuilder" :   require('Roles_remote_builder'),
        "remotecourier":    require('Roles_remote_courier'),
        "remoteminer":      require('Roles_remote_miner'),
        "remotetransport":  require('Roles_remote_transport'),
        "reserver":         require('Roles_remote_reserver')
    },general : [
        "harvester", "transport", "linker", "filler", "courier", "claimer", "starter","upgrader", "builder", "mechanic"
    ]
}